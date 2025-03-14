import { NextRequest, NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { Readable } from 'stream';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '../../auth/middleware';

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

// 生成安全的文件名
function sanitizeFileName(fileName: string): string {
  // 只保留汉字字符
  let chineseOnly = '';
  for (let i = 0; i < fileName.length; i++) {
    const char = fileName.charAt(i);
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

// 生成最终文件名
function generateFileName(fileName: string, type: string): string {
  const sanitizedTitle = sanitizeFileName(fileName);
  const suffix = type === 'draft' ? '初稿' : 
                 type === 'teacher_final' ? '老师修改终稿' : 
                 '文档';
  return `${sanitizedTitle}-${suffix}.docx`;
}

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户信息
    const username = await getCurrentUser();
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: '未登录，无法上传文件'
      }, { status: 401 });
    }

    // 处理FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // 从FormData获取文件类型和文件名（不再从请求头获取）
    const fileType = formData.get('fileType')?.toString() || 'document';
    const rawFileName = formData.get('fileName')?.toString() || '文档';
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }
    
    // 检查文件类型
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return NextResponse.json(
        { error: '只支持.docx格式的文件' },
        { status: 400 }
      );
    }
    
    // 生成文件名
    const fileName = generateFileName(rawFileName, fileType);
    
    // 获取当前年级
    const currentGrade = calculateCurrentGrade();
    const gradeText = getGradeText(currentGrade);
    
    // 为不同类型文档生成不同的保存路径
    let filePath;
    if (fileType === 'draft') {
      filePath = `outlines/${username}/${gradeText}/作文初稿/${fileName}`;
    } else if (fileType === 'teacher_final') {
      filePath = `outlines/${username}/${gradeText}/老师批改/${fileName}`;
    } else {
      filePath = `outlines/${username}/${gradeText}/文档/${fileName}`;
    }
    
    // 获取文件的ArrayBuffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // 上传文件到腾讯云COS
    const uploadResult = await new Promise<string>((resolve, reject) => {
      cos.putObject({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: filePath,
        Body: fileBuffer,
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
    
    // 返回成功信息
    return NextResponse.json({
      success: true,
      file: {
        url: uploadResult,
        fileName: fileName,
        filePath: filePath,
        title: sanitizeFileName(rawFileName)
      },
      message: '文档已成功上传到云端'
    });
    
  } catch (error: any) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: `上传失败：${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
} 