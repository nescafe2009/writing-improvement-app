import { NextResponse } from 'next/server';
import { cos, cosConfig } from '@/config/cos';
import { getCurrentUser } from '../../auth/middleware';

export async function GET() {
  try {
    // 获取当前用户信息
    const username = await getCurrentUser();
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: '未登录，无法获取用户统计数据'
      }, { status: 401 });
    }

    // 从腾讯云COS获取用户文档数量
    const listResult = await new Promise((resolve, reject) => {
      cos.getBucket({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Prefix: `outlines/${username}/`, // 只获取当前用户的文件
        MaxKeys: 1000,
      }, (err, data) => {
        if (err) {
          console.error('获取COS对象列表失败:', err);
          reject(err);
        } else {
          console.log('成功获取COS对象列表，数量:', data.Contents?.length || 0);
          resolve(data.Contents || []);
        }
      });
    });

    // 过滤出各类文档
    const files = listResult as any[];
    const validFiles = files.filter(item => item.Key && item.Key.endsWith('.docx'));
    
    // 统计各类型文档数量
    const drafts = validFiles.filter(item => item.Key.includes('/作文初稿/')).length;
    const outlines = validFiles.filter(item => item.Key.includes('/作文提纲/')).length;
    const aiReviews = validFiles.filter(item => item.Key.includes('/AI评价/')).length;
    const aiImproved = validFiles.filter(item => item.Key.includes('/AI修改/')).length;
    const teacherReviewed = validFiles.filter(item => item.Key.includes('/老师批改/')).length;
    
    // 计算总数 - 现在完成作文数只计算作文初稿数量
    const completedEssays = drafts; // 修改：只统计作文初稿
    // 计算总数 - 现在批改作文数只计算AI评价文档
    const reviewedEssays = aiReviews; // 修改：只统计AI评价文档
    
    // 计算真实的进步率和平均分数
    // 1. 获取评价文档信息
    const reviewFiles = validFiles.filter(
      item => item.Key.includes('/AI评价/') || item.Key.includes('/老师批改/')
    );
    
    // 2. 按时间排序 (COS中的LastModified字段)
    reviewFiles.sort((a, b) => {
      const timeA = new Date(a.LastModified).getTime();
      const timeB = new Date(b.LastModified).getTime();
      return timeA - timeB;
    });
    
    // 3. 计算平均分和进步率
    let averageScore = 75; // 默认值
    let improvementRate = 0;
    
    // 从文件名中提取分数 (假设评价文档的文件名可能包含分数，如"作文题目_85分.docx")
    const extractScoreFromKey = (key: string): number | null => {
      const match = key.match(/(\d{2,3})分/);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        if (score >= 0 && score <= 100) {
          return score;
        }
      }
      return null;
    };
    
    // 收集所有分数
    const scores: number[] = [];
    for (const file of reviewFiles) {
      const score = extractScoreFromKey(file.Key);
      if (score !== null) {
        scores.push(score);
      }
    }
    
    if (scores.length > 0) {
      // 计算平均分
      averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      
      // 计算进步率 - 对比最早的几篇和最近的几篇
      if (scores.length >= 4) {
        // 至少有4篇有分数的作文时才计算进步率
        const earlyScoresCount = Math.min(Math.floor(scores.length / 2), 3); // 取前一半或最多3篇
        const recentScoresCount = Math.min(Math.floor(scores.length / 2), 3); // 取后一半或最多3篇
        
        const earlyScores = scores.slice(0, earlyScoresCount);
        const recentScores = scores.slice(-recentScoresCount);
        
        const earlyAverage = earlyScores.reduce((sum, score) => sum + score, 0) / earlyScores.length;
        const recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        
        if (earlyAverage > 0) {
          // 计算提升百分比
          improvementRate = Math.round(((recentAverage - earlyAverage) / earlyAverage) * 100);
          // 确保进步率是正数，如果是负数则显示为0
          improvementRate = Math.max(0, improvementRate);
        }
      } else if (scores.length >= 2) {
        // 至少有2篇作文时，对比第一篇和最后一篇
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        
        if (firstScore > 0) {
          improvementRate = Math.round(((lastScore - firstScore) / firstScore) * 100);
          improvementRate = Math.max(0, improvementRate);
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        completedEssays, 
        reviewedEssays,
        averageScore,
        improvementRate,
        drafts,
        outlines,
        aiReviews,
        aiImproved,
        teacherReviewed,
        totalFiles: validFiles.length
      }
    });
  } catch (error: any) {
    console.error('获取用户统计数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户统计数据失败: ' + (error.message || '未知错误')
    }, { status: 500 });
  }
} 