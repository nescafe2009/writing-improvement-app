import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';

// 用于生成文件名的辅助函数
function generateUniqueFileName(title: string): string {
  // 使用作文标题作为文件名，进行安全处理
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
  // 直接使用作文标题作为文件名，不再添加时间戳
  return `${sanitizedTitle}.docx`;
}

export async function POST(request: Request) {
  try {
    const { title, grade, writingGuide } = await request.json();

    if (!title || !writingGuide) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 准备写作提纲内容
    let outlineContent = `${title}\n\n作文提纲\n\n`;
    
    writingGuide.outline.forEach((section: any, index: number) => {
      outlineContent += `${index + 1}. ${section.title}：${section.content}\n`;
      if (section.subItems && section.subItems.length > 0) {
        section.subItems.forEach((subItem: any, subIndex: number) => {
          outlineContent += `   - ${subItem.title}：${subItem.content}\n`;
        });
      }
    });
    
    outlineContent += '\n写作建议：\n';
    writingGuide.suggestions.forEach((suggestion: string, index: number) => {
      outlineContent += `${index + 1}. ${suggestion}\n`;
    });
    
    outlineContent += '\n关键点：\n';
    writingGuide.keyPoints.forEach((point: string, index: number) => {
      outlineContent += `${index + 1}. ${point}\n`;
    });
    
    if (writingGuide.references && writingGuide.references.length > 0) {
      outlineContent += '\n参考资料：\n';
      writingGuide.references.forEach((ref: string, index: number) => {
        outlineContent += `${index + 1}. ${ref}\n`;
      });
    }

    // 生成文件名
    const fileName = generateUniqueFileName(title);
    
    // 在腾讯云COS中创建文件路径 - 年级后添加"作文提纲"子目录
    const filePath = `outlines/${grade}/作文提纲/${fileName}`;
    
    console.log('COS配置:', {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region
    });
    
    // 上传文本内容到腾讯云COS
    return new Promise(async (resolve, reject) => {
      cos.putObject({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: filePath,
        Body: outlineContent,
        ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ACL: 'public-read', // 设置对象的访问权限为公共可读
      }, async (err, data) => {
        if (err) {
          console.error('上传到腾讯云COS失败:', err);
          return resolve(NextResponse.json(
            { error: '上传文件失败：' + err.message },
            { status: 500 }
          ));
        }
        
        try {
          // 生成带签名的下载URL
          const signedUrl = await getPresignedUrl(filePath, 3600); // 1小时有效期
          
          // 返回成功响应，包含文件URL和文件名
          resolve(NextResponse.json({
            success: true,
            fileUrl: signedUrl, // 使用带签名的URL
            fileName: fileName,
            message: '文件已成功保存到腾讯云COS'
          }));
        } catch (error: any) {
          console.error('生成签名URL失败:', error);
          // 如果生成签名URL失败，使用普通URL
          const downloadURL = `${cosConfig.BaseUrl}/${filePath}`;
          resolve(NextResponse.json({
            success: true,
            fileUrl: downloadURL,
            fileName: fileName,
            message: '文件已成功保存到腾讯云COS（无签名URL）'
          }));
        }
      });
    });

  } catch (error: any) {
    console.error('保存文档错误:', error);
    return NextResponse.json(
      { error: '保存文档失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}