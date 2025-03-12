import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { 
  Document, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, Packer, convertInchesToTwip,
  BorderStyle, SectionType
} from 'docx';

// 用于生成文件名的辅助函数
function generateUniqueFileName(title: string, grade: string): string {
  // 使用作文标题作为文件名，进行安全处理
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 50);
  // 添加时间戳以避免重名
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
  // 添加年级信息
  const gradeText = getGradeText(grade);
  return `${gradeText}_${sanitizedTitle}_初稿_${timestamp}.docx`;
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

export async function POST(request: Request) {
  try {
    const { title, essay, feedback, grade } = await request.json();

    if (!title || !essay || !feedback) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 使用默认年级（五年级）如果未提供
    const gradeToUse = grade || '5';
    const gradeText = getGradeText(gradeToUse);

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
    
    // 添加年级信息 (小四号宋体)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `${gradeText} · 上海`,
            font: "SimSun", // 宋体
            size: 28, // 小四号 (28 half-points = 14pt)
            color: "666666" // 灰色
          })
        ]
      })
    );
    
    // 添加"AI修改后的作文"标题 (小三号宋体)
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
            text: "AI修改后的作文",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 添加作文内容 (小四号宋体)
    // 将作文按段落分割
    const paragraphs = feedback.improvedEssay.split('\n').filter((p: string) => p.trim() !== '');
    
    paragraphs.forEach((paraText: string) => {
      docChildren.push(
        new Paragraph({
          spacing: {
            after: 200 // 段后间距
          },
          children: [
            new TextRun({
              text: paraText,
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加评分和点评部分
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 300,
          after: 200
        },
        children: [
          new TextRun({
            text: "AI点评及评分",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 添加评分
    docChildren.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `评分：${feedback.score}分`,
            font: "SimSun", // 宋体
            size: 28, // 小四号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 添加优点
    docChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "优点：",
            font: "SimSun", // 宋体
            size: 28, // 小四号
            bold: true,
            color: "007700" // 深绿色
          })
        ]
      })
    );
    
    feedback.strengths.forEach((item: string, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: convertInchesToTwip(0.2) },
          children: [
            new TextRun({
              text: `${index + 1}. ${item}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加有待改进
    docChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "有待改进：",
            font: "SimSun", // 宋体
            size: 28, // 小四号
            bold: true,
            color: "CC0000" // 红色
          })
        ]
      })
    );
    
    feedback.weaknesses.forEach((item: string, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: convertInchesToTwip(0.2) },
          children: [
            new TextRun({
              text: `${index + 1}. ${item}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加改进建议
    docChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "改进建议：",
            font: "SimSun", // 宋体
            size: 28, // 小四号
            bold: true,
            color: "0055AA" // 蓝色
          })
        ]
      })
    );
    
    feedback.suggestions.forEach((item: string, index: number) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: convertInchesToTwip(0.2) },
          children: [
            new TextRun({
              text: `${index + 1}. ${item}`,
              font: "SimSun", // 宋体
              size: 28, // 小四号
              color: "000000" // 黑色
            })
          ]
        })
      );
    });
    
    // 添加原始作文
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 300,
          after: 200
        },
        children: [
          new TextRun({
            text: "原始作文",
            font: "SimSun", // 宋体
            size: 30, // 小三号
            bold: true,
            color: "000000" // 黑色
          })
        ]
      })
    );
    
    // 将原始作文按段落分割
    const originalParagraphs = essay.split('\n').filter((p: string) => p.trim() !== '');
    
    originalParagraphs.forEach((paraText: string) => {
      docChildren.push(
        new Paragraph({
          spacing: {
            after: 200 // 段后间距
          },
          children: [
            new TextRun({
              text: paraText,
              font: "SimSun", // 宋体
              size: 28, // 小四号 (28 half-points = 14pt)
              color: "666666" // 灰色
            })
          ]
        })
      );
    });
    
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
    const fileName = generateUniqueFileName(title, gradeToUse);
    
    // 在腾讯云COS中创建文件路径 - 保存到"作文初稿"子目录
    const filePath = `outlines/${gradeText}/作文初稿/${fileName}`;
    
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
            message: '作文初稿已成功保存到腾讯云COS'
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
            message: '作文初稿已成功保存到腾讯云COS（无签名URL）'
          }));
        }
      });
    });

  } catch (error: any) {
    console.error('保存作文初稿错误:', error);
    return NextResponse.json(
      { error: `保存作文初稿失败：${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
} 