import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// 豆包视觉模型API配置 - 根据火山引擎文档
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.DOUBAO_API_KEY || '';
const MODEL_NAME = 'doubao-1.5-vision-pro-32k-250115';

// 临时目录配置
const TEMP_DIR = join(process.cwd(), 'tmp', 'uploads');
// 图片大小限制（单位：字节）- 1MB
const MAX_IMAGE_SIZE = 1024 * 1024;
// 图片压缩质量（1-100）
const IMAGE_QUALITY = 80;
// 最大图片尺寸（像素）
const MAX_IMAGE_DIMENSION = 1200;

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await mkdir(TEMP_DIR, { recursive: true });
    console.log('临时目录已确认存在:', TEMP_DIR);
  } catch (error) {
    console.error('创建临时目录失败:', error);
    throw new Error('无法创建临时目录');
  }
}

// 压缩图片函数
async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    console.log('开始压缩图片，原始大小:', buffer.length);
    
    // 根据MIME类型确定输出格式
    const format = mimeType.includes('png') ? 'png' : 'jpeg';
    
    // 使用sharp调整图片大小和质量
    const resizedBuffer = await sharp(buffer)
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(format, { quality: IMAGE_QUALITY })
      .toBuffer();
    
    console.log('压缩后图片大小:', resizedBuffer.length);
    return resizedBuffer;
  } catch (error) {
    console.error('图片压缩失败:', error);
    return buffer; // 如果压缩失败，则返回原始buffer
  }
}

export async function POST(request: NextRequest) {
  // 创建一个临时文件数组，用于清理
  const tempFilePaths: string[] = [];
  
  try {
    // 确保临时目录存在
    await ensureTempDir();

    // 接收多部分表单数据
    const formData = await request.formData();
    const imageFiles = formData.getAll('images') as File[];
    
    console.log('接收到FormData数据，包含图片数量:', imageFiles.length);

    // 检查是否有图片文件
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: '没有找到图片文件' },
        { status: 400 }
      );
    }

    // 处理所有图片
    const imageContents = [];
    
    for (const imageFile of imageFiles) {
      if (!imageFile.type.startsWith('image/')) {
        console.log('跳过非图片文件:', imageFile.name);
        continue;
      }

      // 获取图片数据
      const originalBuffer = Buffer.from(await imageFile.arrayBuffer());
      
      // 压缩图片
      console.log('处理图片:', imageFile.name, '原始大小:', originalBuffer.length);
      const compressedBuffer = await compressImage(originalBuffer, imageFile.type);

      // 生成临时文件名
      const tempFileName = `${uuidv4()}-${imageFile.name}`;
      const tempFilePath = join(TEMP_DIR, tempFileName);

      // 保存文件
      await writeFile(tempFilePath, compressedBuffer);
      tempFilePaths.push(tempFilePath);
      console.log('已保存图片到临时文件:', tempFilePath);

      // 转换为base64格式
      const base64Image = compressedBuffer.toString('base64');
      
      // 添加到图片内容数组
      imageContents.push({
        type: 'image_url',
        image_url: {
          url: `data:${imageFile.type};base64,${base64Image}`
        }
      });
    }
    
    if (imageContents.length === 0) {
      return NextResponse.json(
        { error: '没有有效的图片文件' },
        { status: 400 }
      );
    }
    
    console.log('处理完成，准备发送到豆包视觉模型API');

    // 构建API请求体
    const requestBody = {
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请识别这些图片中的所有文字内容，保持原始段落格式，自动纠正明显的错误。请直接返回识别后的纯文本，不要添加任何解释、批注或分析。'
            },
            ...imageContents
          ]
        }
      ],
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 4000
    };
    
    // 发送请求到豆包API
    console.log('发送请求到豆包视觉模型API');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('豆包API响应状态:', response.status, response.statusText);
    
    // 清理临时文件
    await Promise.all(tempFilePaths.map(async (filePath) => {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`删除临时文件 ${filePath} 失败:`, error);
      }
    }));
    console.log('已清理所有临时文件');

    // 处理响应
    if (!response.ok) {
      let errorMessage = '';
      
      // 尝试获取错误详情
      try {
        const responseText = await response.text();
        console.error('豆包API错误响应:', responseText);
        errorMessage = `OCR处理失败: ${response.status} - ${responseText.substring(0, 300)}`;
      } catch (error) {
        console.error('读取错误响应失败:', error);
        errorMessage = `OCR处理失败: ${response.status}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // 解析成功响应
    try {
      const result = await response.json();
      console.log('豆包API响应结构:', JSON.stringify(result, null, 2).substring(0, 300) + '...');
      
      // 从响应中提取文本内容
      const recognizedText = result.choices?.[0]?.message?.content || '';
      console.log('成功获取识别文本，长度:', recognizedText.length);
      
      return NextResponse.json(
        { text: recognizedText || '未能识别出文字' },
        { status: 200 }
      );
    } catch (error) {
      console.error('解析API响应失败:', error);
      return NextResponse.json(
        { error: '解析识别结果失败', details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    // 确保清理临时文件，即使发生错误
    for (const filePath of tempFilePaths) {
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        // 忽略清理错误
      }
    }
    
    console.error('OCR处理错误:', error);
    return NextResponse.json(
      { error: '处理图片时发生错误', details: String(error) },
      { status: 500 }
    );
  }
} 