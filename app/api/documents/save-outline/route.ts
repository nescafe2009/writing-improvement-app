import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { 
  Document, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, Packer, convertInchesToTwip,
  BorderStyle, SectionType, PageOrientation
} from 'docx';

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

    // 文档内容
    const docChildren: Paragraph[] = [];
    
    // 添加标题 (四号宋体)
    docChildren.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        run: {
          font: "SimSun", // 宋体
          size: 32, // 四号 (32 half-points = 16pt)
          bold: true
        }
      })
    );
    
    // 添加作文提纲标题 (小三号宋体)
    docChildren.push(
      new Paragraph({
        text: "作文提纲",
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 200,
          after: 200
        },
        run: {
          font: "SimSun", // 宋体
          size: 30, // 小三号
          bold: true
        }
      })
    );
    
    // 添加提纲内容 (小四号宋体)
    writingGuide.outline.forEach((section: any, index: number) => {
      docChildren.push(
        new Paragraph({
          text: `${index + 1}. ${section.title}：${section.content}`,
          spacing: {
            after: 100
          },
          run: {
            font: "SimSun", // 宋体
            size: 28, // 小四号 (28 half-points = 14pt)
          }
        })
      );
      
      if (section.subItems && section.subItems.length > 0) {
        section.subItems.forEach((subItem: any) => {
          docChildren.push(
            new Paragraph({
              text: `   - ${subItem.title}：${subItem.content}`,
              indent: {
                left: convertInchesToTwip(0.3) // 左侧缩进
              },
              spacing: {
                after: 100
              },
              run: {
                font: "SimSun", // 宋体
                size: 28, // 小四号 (28 half-points = 14pt)
              }
            })
          );
        });
      }
    });
    
    // 添加写作建议
    docChildren.push(
      new Paragraph({
        text: "写作建议",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 200
        },
        run: {
          font: "SimSun", // 宋体
          size: 30, // 小三号
          bold: true
        }
      })
    );
    
    writingGuide.suggestions.forEach((suggestion: string, index: number) => {
      docChildren.push(
        new Paragraph({
          text: `${index + 1}. ${suggestion}`,
          spacing: {
            after: 100
          },
          run: {
            font: "SimSun", // 宋体
            size: 28, // 小四号 (28 half-points = 14pt)
          }
        })
      );
    });
    
    // 添加关键点
    docChildren.push(
      new Paragraph({
        text: "关键点",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 200
        },
        run: {
          font: "SimSun", // 宋体
          size: 30, // 小三号
          bold: true
        }
      })
    );
    
    writingGuide.keyPoints.forEach((point: string, index: number) => {
      docChildren.push(
        new Paragraph({
          text: `${index + 1}. ${point}`,
          spacing: {
            after: 100
          },
          run: {
            font: "SimSun", // 宋体
            size: 28, // 小四号 (28 half-points = 14pt)
          }
        })
      );
    });
    
    // 添加参考资料（如果有）
    if (writingGuide.references && writingGuide.references.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "参考资料",
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 200
          },
          run: {
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true
          }
        })
      );
      
      writingGuide.references.forEach((ref: string, index: number) => {
        docChildren.push(
          new Paragraph({
            text: `${index + 1}. ${ref}`,
            spacing: {
              after: 100
            },
            run: {
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
            }
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
      Region: cosConfig.Region
    });
    
    // 上传文档内容到腾讯云COS
    return new Promise(async (resolve, reject) => {
      cos.putObject({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: filePath,
        Body: buffer, // 使用文档二进制数据
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