import { NextResponse } from 'next/server';
import { cos, cosConfig, getPresignedUrl } from '@/config/cos';

// 文档类型映射
interface DocumentTypeMap {
  [key: string]: string;
}

// 从Key路径推断文档类型
function inferDocumentType(key: string): string {
  if (key.includes('/作文提纲/')) {
    return 'outline';
  } else if (key.includes('/草稿/')) {
    return 'draft';
  } else if (key.includes('/AI修改/')) {
    return 'ai_revised';
  } else if (key.includes('/老师批改/')) {
    return 'teacher_final';
  } else {
    return 'unknown';
  }
}

// 从文件名提取标题（移除.docx后缀）
function extractTitle(filename: string): string {
  return filename.replace(/\.docx$/, '');
}

// 从路径中提取年级信息
function extractGrade(key: string): string {
  const match = key.match(/outlines\/([^\/]+)/);
  return match ? match[1] : '未知年级';
}

// 从文件的LastModified属性格式化日期
function formatDate(lastModified: Date): string {
  return lastModified.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    // 获取查询参数
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    console.log('正在获取COS文档列表，配置信息:', {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Prefix: 'outlines/',
      Type: type
    });
    
    // 列出存储桶中的所有对象
    const listResult = await new Promise((resolve, reject) => {
      cos.getBucket({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Prefix: 'outlines/', // 只获取outlines目录下的文件
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
    
    console.log(`找到 ${listResult.length} 个文件，开始处理...`);
    
    // 处理文件列表
    const documents = await Promise.all(
      (listResult as any[])
        .filter(item => item.Key && item.Key.endsWith('.docx'))
        .map(async (item) => {
          const docType = inferDocumentType(item.Key);
          
          // 如果指定了类型过滤，则跳过不匹配的文档
          if (type && type !== 'all' && docType !== type) {
            return null;
          }
          
          // 提取文件名
          const filename = item.Key.split('/').pop() || '';
          
          // 生成下载链接
          let downloadUrl;
          try {
            console.log(`正在为文件生成预签名URL: ${item.Key}`);
            downloadUrl = await getPresignedUrl(item.Key, 3600);
          } catch (error) {
            console.error(`生成预签名URL失败: ${item.Key}, 使用普通URL代替`, error);
            downloadUrl = `${cosConfig.BaseUrl}/${item.Key}`;
          }
          
          return {
            id: item.Key, // 使用Key作为唯一ID
            title: extractTitle(filename),
            date: formatDate(new Date(item.LastModified)),
            grade: extractGrade(item.Key),
            type: docType,
            size: Math.round(item.Size / 1024) || 0, // 文件大小(KB)
            url: downloadUrl,
            status: docType === 'teacher_final' ? '已批改' : (docType === 'draft' ? '草稿' : '已提交'),
            score: docType === 'teacher_final' ? Math.floor(Math.random() * 30) + 70 : null, // 模拟分数
          };
        })
    );
    
    // 过滤掉null值（不匹配类型的文档）
    const filteredDocuments = documents.filter(doc => doc !== null);
    
    console.log(`成功处理 ${filteredDocuments.length} 个文档`);
    
    return NextResponse.json({
      success: true,
      documents: filteredDocuments
    });
  } catch (error: any) {
    console.error('获取文档列表错误:', error);
    return NextResponse.json({
      success: false,
      error: '获取文档列表失败: ' + (error.message || '未知错误'),
      details: error.toString()
    }, { status: 500 });
  }
} 