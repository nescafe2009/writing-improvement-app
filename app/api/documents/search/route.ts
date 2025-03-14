import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';
import { getCurrentUser } from '../../auth/middleware';

// 从Key路径推断文档类型
function inferDocumentType(key: string): string {
  if (key.includes('/作文提纲/')) {
    return 'outline';
  } else if (key.includes('/作文初稿/')) {
    return 'draft';
  } else if (key.includes('/AI评价/')) {
    return 'ai_review';
  } else if (key.includes('/AI修改/')) {
    return 'ai_improved';
  } else if (key.includes('/老师批改/')) {
    return 'teacher_final';
  } else {
    return 'unknown';
  }
}

// 从文件名提取标题（移除.docx后缀和其他后缀）
function extractTitle(filename: string): string {
  return filename.replace(/\-(初稿|AI评价|AI修改|老师修改终稿)?(\.docx)?$/, '');
}

// 从路径中提取年级信息
function extractGrade(key: string): string {
  // 新格式: outlines/username/年级/...
  const match = key.match(/outlines\/[^\/]+\/([^\/]+)/);
  return match ? match[1] : '未知年级';
}

// 从路径中提取用户名
function extractUsername(key: string): string {
  // 新格式: outlines/username/年级/...
  const match = key.match(/outlines\/([^\/]+)/);
  return match ? match[1] : '未知用户';
}

// 计算字符串相似度（使用Levenshtein距离算法）
function calculateSimilarity(str1: string, str2: string): number {
  // 转换为小写并去除空格，以提高匹配精度
  const s1 = str1.toLowerCase().replace(/\s+/g, '');
  const s2 = str2.toLowerCase().replace(/\s+/g, '');
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  // 创建距离矩阵
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // 计算Levenshtein距离
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }
  
  // 计算相似度得分（0-100）
  // Levenshtein距离越小，相似度越高
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 100; // 两个都是空字符串，完全匹配
  
  // 转换为0-100的分数，距离越小得分越高
  const similarity = 100 * (1 - matrix[len1][len2] / maxLen);
  return similarity;
}

// 从文件的LastModified属性格式化日期
function formatDate(lastModified: Date): string {
  return lastModified.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    // 获取当前用户信息
    const username = await getCurrentUser();
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: '未登录，无法搜索文档'
      }, { status: 401 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    const type = url.searchParams.get('type') || 'draft'; // 默认搜索作文初稿
    const minSimilarity = parseFloat(url.searchParams.get('minSimilarity') || '50'); // 默认相似度阈值为50%
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: '请提供搜索关键词'
      }, { status: 400 });
    }
    
    console.log('正在搜索文档，配置信息:', {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Keyword: keyword,
      Type: type,
      Prefix: `outlines/${username}/`
    });
    
    // 列出存储桶中的所有对象
    const listResult = await new Promise((resolve, reject) => {
      cos.getBucket({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Prefix: `outlines/${username}/`, // 只获取当前用户的文件
        MaxKeys: 1000, // 最多返回1000个文件
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
    
    if (!Array.isArray(listResult)) {
      return NextResponse.json({
        success: false,
        error: '获取文件列表失败'
      }, { status: 500 });
    }
    
    // 如果列表为空，返回空数组
    if (listResult.length === 0) {
      return NextResponse.json({
        success: true,
        documents: []
      });
    }
    
    console.log(`找到 ${listResult.length} 个文件，开始搜索匹配...`);
    
    // 过滤并处理文件列表
    const matchResults = await Promise.all(
      (listResult as any[])
        .filter(item => item.Key && item.Key.endsWith('.docx'))
        .map(async (item) => {
          const docType = inferDocumentType(item.Key);
          
          // 如果指定了类型过滤，则跳过不匹配的文档
          if (type !== 'all' && docType !== type) {
            return null;
          }
          
          // 提取文件名和标题
          const filename = item.Key.split('/').pop() || '';
          const title = extractTitle(filename);
          
          // 计算相似度
          const similarity = calculateSimilarity(title, keyword);
          
          // 如果相似度低于阈值，不返回此结果
          if (similarity < minSimilarity) {
            return null;
          }
          
          // 生成下载链接
          let downloadUrl;
          try {
            downloadUrl = await getPresignedUrl(item.Key, 3600);
          } catch (error) {
            console.error(`生成预签名URL失败: ${item.Key}, 使用普通URL代替`, error);
            downloadUrl = `${cosConfig.BaseUrl}/${item.Key}`;
          }
          
          return {
            id: item.Key,
            title: title,
            filename: filename,
            date: formatDate(new Date(item.LastModified)),
            grade: extractGrade(item.Key),
            type: docType,
            size: Math.round(item.Size / 1024) || 0, // 文件大小(KB)
            url: downloadUrl,
            similarity: Math.round(similarity * 100) / 100, // 保留两位小数
          };
        })
    );
    
    // 过滤掉null值，并按相似度降序排序
    const filteredResults = matchResults
      .filter(doc => doc !== null)
      .sort((a, b) => b!.similarity - a!.similarity);
    
    console.log(`找到 ${filteredResults.length} 个匹配文档`);
    
    return NextResponse.json({
      success: true,
      documents: filteredResults
    });
  } catch (error: any) {
    console.error('搜索文档错误:', error);
    return NextResponse.json({
      success: false,
      error: '搜索文档失败: ' + (error.message || '未知错误'),
      details: error.toString()
    }, { status: 500 });
  }
} 