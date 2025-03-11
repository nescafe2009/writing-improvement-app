import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { 
  Document, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, Packer, convertInchesToTwip,
  BorderStyle, SectionType
} from 'docx';

// 用于生成文件名的辅助函数
function generateUniqueFileName(title: string): string {
  // 使用作文标题作为文件名，进行安全处理
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
  // 直接使用作文标题作为文件名，不添加时间戳
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

    // 文档内容
    const docChildren: Paragraph[] = [];
    
    // 添加标题 (四号宋体)
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: title,
            font: "SimSun", // 宋体
            size: 32, // 四号 (32 half-points = 16pt)
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 添加作文提纲标题 (小三号宋体)
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 200,
          after: 200
        },
        children: [
          new TextRun({
            text: "作文提纲",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 添加提纲内容 (小四号宋体)
    writingGuide.outline.forEach((section: any, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: {
            after: 100
          },
          children: [
            new TextRun({
              text: `${index + 1}. ${section.title}：${section.content}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
              color: "000000" // 黑色
            })
          ]
        })
      );
      
      if (section.subItems && section.subItems.length > 0) {
        section.subItems.forEach((subItem: any) => {
          docChildren.push(
            new Paragraph({
              indent: {
                left: convertInchesToTwip(0.3) // 左侧缩进
              },
              spacing: {
                after: 100
              },
              children: [
                new TextRun({
                  text: `   - ${subItem.title}：${subItem.content}`,
                  font: "SimSun", // 宋体
                  size: 28, // 小四号 (28 half-points = 14pt)
                  color: "000000" // 黑色
                })
              ]
            })
          );
        });
      }
    });
    
    // 添加写作建议
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 200
        },
        children: [
          new TextRun({
            text: "写作建议",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    writingGuide.suggestions.forEach((suggestion: string, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: {
            after: 100
          },
          children: [
            new TextRun({
              text: `${index + 1}. ${suggestion}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加关键点
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 200
        },
        children: [
          new TextRun({
            text: "关键点",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    writingGuide.keyPoints.forEach((point: string, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: {
            after: 100
          },
          children: [
            new TextRun({
              text: `${index + 1}. ${point}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加参考资料（如果有）
    if (writingGuide.references && writingGuide.references.length > 0) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 200
          },
          children: [
            new TextRun({
              text: "参考资料",
              font: "SimSun", // 宋体
              size: 30, // 小三号
              bold: true,
              color: "000000" // 黑色
            })
          ]
        })
      );
      
      writingGuide.references.forEach((ref: string, index: number) => {
        docChildren.push(
          new Paragraph({
            spacing: {
              after: 100
            },
            children: [
              new TextRun({
                text: `${index + 1}. ${ref}`,
                font: "SimSun", // 宋体
                size: 28, // 小四号 (28 half-points = 14pt)
                color: "000000" // 黑色
              })
            ]
          })
        );
      });
    }
    
    // 创建Word文档并添加内容
    const doc = new Document({
      sections: [{
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: 600, // 上边距
              right: 600, // 右边距
              bottom: 600, // 下边距
              left: 600, // 左边距
            }
          }
        },
        children: docChildren
      }]
    });
    
    // 生成Word文档的二进制数据
    const buffer = await Packer.toBuffer(doc);
    
    // 生成文件名
    const fileName = generateUniqueFileName(title);
    
    // 在腾讯云COS中创建文件路径 - 年级后添加"作文提纲"子目录
    const filePath = `outlines/${grade}/作文提纲/${fileName}`;
    
    console.log('COS配置:', {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      FilePath: filePath
    });
    
    // 上传文档内容到腾讯云COS
    return new Promise(async (resolve, reject) => {
      cos.putObject({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: filePath,
        Body: buffer, // 使用文档二进制数据
        ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ACL: 'default', // 使用存储桶默认权限，应确保存储桶本身具有公共读取权限
        // StorageClass: 'STANDARD', // 存储类型，默认标准存储
        onProgress: function(progressData) {
          console.log('上传进度:', JSON.stringify(progressData));
        }
      }, async (err, data) => {
        if (err) {
          console.error('上传到腾讯云COS失败:', err);
          return resolve(NextResponse.json(
            { error: '上传文件失败：' + err.message },
            { status: 500 }
          ));
        }
        
        try {
          console.log('文件上传成功:', data);
          
          // 生成带签名的下载URL
          const signedUrl = await getPresignedUrl(filePath, 3600); // 1小时有效期
          console.log('生成签名URL成功:', signedUrl);
          
          // 返回成功响应，包含文件URL和文件名
          resolve(NextResponse.json({
            success: true,
            fileUrl: signedUrl, // 使用带签名的URL
            fileName: fileName,
            filePath: filePath,
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
            filePath: filePath,
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