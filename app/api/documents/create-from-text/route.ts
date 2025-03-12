import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { 
  Document, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, Packer, SectionType
} from 'docx';

// 生成安全的文件名
function sanitizeFileName(title: string): string {
  // 只保留汉字字符
  let chineseOnly = '';
  for (let i = 0; i < title.length; i++) {
    const char = title.charAt(i);
    if (/[\u4e00-\u9fa5]/.test(char)) { // 仅保留汉字
      chineseOnly += char;
    }
  }
  
  // 如果过滤后没有汉字，使用默认名称
  if (chineseOnly.length === 0) {
    return '文档';
  }
  
  // 截取合适长度
  return chineseOnly.substring(0, 20);
}

// 生成文件名
function generateFileName(title: string, type: string): string {
  const sanitizedTitle = sanitizeFileName(title);
  const suffix = type === 'draft' ? '初稿' : 
                 type === 'teacher_final' ? '老师修改终稿' : 
                 '文档';
  return `${sanitizedTitle}-${suffix}.docx`;
}

// 创建文档
async function createDocument(text: string, title: string): Promise<Buffer> {
  const docChildren: Paragraph[] = [];
  
  // 添加标题
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          font: "SimSun", // 宋体
          size: 32, // 四号
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加文本内容
  const paragraphs = text.split('\n').filter((p: string) => p.trim() !== '');
  
  paragraphs.forEach((paraText: string) => {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: paraText,
            font: "SimSun",
            size: 28, // 小四号
            color: "000000"
          })
        ]
      })
    );
  });
  
  const doc = new Document({
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS,
        page: {
          margin: {
            top: 600,
            right: 600,
            bottom: 600,
            left: 600,
          }
        }
      },
      children: docChildren
    }]
  });
  
  return await Packer.toBuffer(doc);
}

// 上传文件到腾讯云COS
async function uploadToCOS(buffer: Buffer, filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    cos.putObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: filePath,
      Body: buffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ACL: 'default',
    }, async (err, data) => {
      if (err) {
        console.error('上传到腾讯云COS失败:', err);
        reject(err);
        return;
      }
      
      try {
        // 生成带签名的下载URL
        const signedUrl = await getPresignedUrl(filePath, 3600); // 1小时有效期
        resolve(signedUrl as string);
      } catch (error) {
        console.error('生成签名URL失败:', error);
        // 如果生成签名URL失败，使用普通URL
        const downloadURL = `${cosConfig.BaseUrl}/${filePath}`;
        resolve(downloadURL);
      }
    });
  });
}

// 将年级数字转换为文本
function getGradeText(grade: string): string {
  const gradeMap: {[key: string]: string} = {
    '1': '一年级',
    '2': '二年级',
    '3': '三年级',
    '4': '四年级',
    '5': '五年级',
    '6': '初一',
    '7': '初二',
    '8': '初三',
    '9': '初四',
    '10': '高一',
    '11': '高二',
    '12': '高三'
  };
  
  return gradeMap[grade] || '未知年级';
}

// 计算当前年级的函数
function calculateCurrentGrade(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
  
  // 基准：
  // 2025年上半年小赵上5年级 (学校的5年级)
  // 2025年下半年小赵上初一 (学校的6年级)
  
  // 上海学制：小学5年（1-5年级），初中4年（6-9年级，对应初一至初四），高中3年（10-12年级）
  
  // 上学期：2-7月，下学期：9-1月
  const isFirstHalf = currentMonth >= 2 && currentMonth <= 7;
  const isSecondHalf = currentMonth >= 9 || currentMonth == 1;
  
  if (currentYear == 2025) {
    if (isFirstHalf) {
      return "5"; // 2025上半年：5年级上学期
    } else if (isSecondHalf) {
      return "6"; // 2025下半年：初一（6年级）下学期
    }
  } else if (currentYear > 2025) {
    // 2025年之后
    const yearDiff = currentYear - 2025;
    const baseGradeFirstHalf = 5; // 2025年上半年是5年级
    const baseGradeSecondHalf = 6; // 2025年下半年是初一（6年级）
    
    if (isFirstHalf) {
      // 上半年
      const calculatedGrade = baseGradeFirstHalf + yearDiff;
      return Math.min(12, calculatedGrade).toString();
    } else if (isSecondHalf) {
      // 下半年
      const calculatedGrade = baseGradeSecondHalf + yearDiff;
      return Math.min(12, calculatedGrade).toString();
    }
  } else if (currentYear < 2025) {
    // 2025年之前，按每年递减一个年级计算
    const yearDiff = 2025 - currentYear;
    const baseGrade = 5; // 2025年上半年是5年级
    
    if (isFirstHalf) {
      // 上半年
      const calculatedGrade = baseGrade - yearDiff;
      return Math.max(1, calculatedGrade).toString();
    } else if (isSecondHalf) {
      // 下半年，提前一个年级
      const calculatedGrade = baseGrade - yearDiff + 1;
      return Math.max(1, Math.min(12, calculatedGrade)).toString();
    }
  }
  
  // 默认返回5年级（如果月份不在定义的学期范围内）
  return "5";
}

// 从OCR识别的文本中提取作文标题
function extractTitleFromText(text: string): string {
  // 假设标题是第一行文字
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length > 0) {
    // 获取第一行作为标题
    const firstLine = lines[0].trim();
    
    // 只保留汉字字符
    let chineseOnly = '';
    for (let i = 0; i < firstLine.length; i++) {
      const char = firstLine.charAt(i);
      if (/[\u4e00-\u9fa5]/.test(char)) { // 仅保留汉字
        chineseOnly += char;
      }
    }
    
    // 如果过滤后没有汉字，使用默认名称
    if (chineseOnly.length === 0) {
      return '作文';
    }
    
    // 如果标题太长，只取前20个字符
    if (chineseOnly.length > 20) {
      return chineseOnly.substring(0, 20);
    }
    
    return chineseOnly;
  }
  
  // 如果无法提取标题，返回默认名称
  return '作文';
}

export async function POST(request: Request) {
  try {
    const { text, title, type } = await request.json();

    if (!text || !title) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 从OCR文本中提取真实标题
    const extractedTitle = extractTitleFromText(text);
    
    // 生成文件名，使用提取的标题而不是传入的标题
    const fileName = generateFileName(extractedTitle, type);
    
    // 获取当前年级
    const currentGrade = calculateCurrentGrade();
    const gradeText = getGradeText(currentGrade);
    
    // 为不同类型文档生成不同的保存路径
    let filePath;
    if (type === 'draft') {
      filePath = `outlines/${gradeText}/作文初稿/${fileName}`;
    } else if (type === 'teacher_final') {
      filePath = `outlines/${gradeText}/老师批改/${fileName}`;
    } else {
      filePath = `outlines/${gradeText}/文档/${fileName}`;
    }
    
    // 创建Word文档，使用提取的标题
    const buffer = await createDocument(text, extractedTitle);
    
    // 上传文档
    const fileUrl = await uploadToCOS(buffer, filePath);
    
    // 返回成功信息
    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        fileName: fileName,
        filePath: filePath,
        extractedTitle: extractedTitle // 返回提取的标题，方便前端使用
      },
      message: '文档已成功保存到云端'
    });
    
  } catch (error: any) {
    console.error('从文本创建文档错误:', error);
    return NextResponse.json(
      { error: `创建文档失败：${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
} 