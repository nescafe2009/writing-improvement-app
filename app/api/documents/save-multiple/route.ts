import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { getCurrentUser } from '../../auth/middleware';
import { 
  Document, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, Packer, convertInchesToTwip,
  BorderStyle, SectionType
} from 'docx';

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
    return '作文';
  }
  
  // 截取合适长度
  return chineseOnly.substring(0, 20);
}

// 生成文件名
function generateFileName(title: string, suffix: string): string {
  const sanitizedTitle = sanitizeFileName(title);
  return `${sanitizedTitle}-${suffix}.docx`;
}

// 创建初稿文档
async function createDraftDocument(essay: string, title: string): Promise<Buffer> {
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
  
  // 添加作文内容
  const paragraphs = essay.split('\n').filter((p: string) => p.trim() !== '');
  
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

// 创建AI评价文档
async function createReviewDocument(essay: string, feedback: any, title: string): Promise<Buffer> {
  const docChildren: Paragraph[] = [];
  
  // 添加标题
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${title} - AI评价`,
          font: "SimSun",
          size: 32,
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加原始作文部分
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: "原始作文",
          font: "SimSun",
          size: 30,
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加原始作文内容
  const originalParagraphs = essay.split('\n').filter((p: string) => p.trim() !== '');
  
  originalParagraphs.forEach((paraText: string) => {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: paraText,
            font: "SimSun",
            size: 28,
            color: "000000"
          })
        ]
      })
    );
  });
  
  // 添加AI评价部分
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: "AI点评及评分",
          font: "SimSun",
          size: 30,
          bold: true,
          color: "000000"
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
          font: "SimSun",
          size: 28,
          bold: true,
          color: "000000"
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
          font: "SimSun",
          size: 28,
          bold: true,
          color: "007700"
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
            font: "SimSun",
            size: 28,
            color: "000000"
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
          font: "SimSun",
          size: 28,
          bold: true,
          color: "CC0000"
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
            font: "SimSun",
            size: 28,
            color: "000000"
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
          font: "SimSun",
          size: 28,
          bold: true,
          color: "0055AA"
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
            font: "SimSun",
            size: 28,
            color: "000000"
          })
        ]
      })
    );
  });
  
  // 添加AI修改后的作文
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: "AI修改后的作文",
          font: "SimSun",
          size: 30,
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加修改后的作文内容
  const improvedParagraphs = feedback.improvedEssay.split('\n').filter((p: string) => p.trim() !== '');
  
  improvedParagraphs.forEach((paraText: string) => {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: paraText,
            font: "SimSun",
            size: 28,
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

// 创建AI修改文档
async function createImprovedDocument(feedback: any, title: string): Promise<Buffer> {
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
          font: "SimSun",
          size: 32,
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加AI修改后的作文
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: "AI修改后的作文",
          font: "SimSun",
          size: 30,
          bold: true,
          color: "000000"
        })
      ]
    })
  );
  
  // 添加修改后的作文内容
  const improvedParagraphs = feedback.improvedEssay.split('\n').filter((p: string) => p.trim() !== '');
  
  improvedParagraphs.forEach((paraText: string) => {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: paraText,
            font: "SimSun",
            size: 28,
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

export async function POST(request: Request) {
  try {
    // 获取当前用户信息
    const username = await getCurrentUser();
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: '未登录，无法保存文档'
      }, { status: 401 });
    }
    
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
    
    // 生成文件名
    const draftFileName = generateFileName(title, '初稿');
    const reviewFileName = generateFileName(title, 'AI评价');
    const improvedFileName = generateFileName(title, 'AI修改');
    
    // 生成文件路径
    const draftFilePath = `outlines/${username}/${gradeText}/作文初稿/${draftFileName}`;
    const reviewFilePath = `outlines/${username}/${gradeText}/AI评价/${reviewFileName}`;
    const improvedFilePath = `outlines/${username}/${gradeText}/AI修改/${improvedFileName}`;
    
    // 创建三个文档
    const draftBuffer = await createDraftDocument(essay, title);
    const reviewBuffer = await createReviewDocument(essay, feedback, title);
    const improvedBuffer = await createImprovedDocument(feedback, title);
    
    // 上传三个文档
    const uploadPromises = [
      uploadToCOS(draftBuffer, draftFilePath),
      uploadToCOS(reviewBuffer, reviewFilePath),
      uploadToCOS(improvedBuffer, improvedFilePath)
    ];
    
    const [draftUrl, reviewUrl, improvedUrl] = await Promise.all(uploadPromises);
    
    // 返回成功信息
    return NextResponse.json({
      success: true,
      draftFile: {
        url: draftUrl,
        fileName: draftFileName,
        filePath: draftFilePath
      },
      reviewFile: {
        url: reviewUrl,
        fileName: reviewFileName,
        filePath: reviewFilePath
      },
      improvedFile: {
        url: improvedUrl,
        fileName: improvedFileName,
        filePath: improvedFilePath
      },
      message: '作文原稿、AI评价和AI修改已成功保存到云端'
    });
    
  } catch (error: any) {
    console.error('保存多文档错误:', error);
    return NextResponse.json(
      { error: `保存文档失败：${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
} 