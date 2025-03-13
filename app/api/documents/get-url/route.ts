import { NextResponse } from 'next/server';
import { getPresignedUrl } from '@/config/cos';

export async function GET(request: Request) {
  try {
    // 从URL参数中获取文档ID
    const url = new URL(request.url);
    const docId = url.searchParams.get('docId');
    
    if (!docId) {
      return NextResponse.json({
        success: false,
        error: '缺少文档ID参数'
      }, { status: 400 });
    }
    
    console.log('获取文档URL，文档ID:', docId);
    
    // 生成带签名的下载URL，1小时有效期
    const signedUrl = await getPresignedUrl(docId, 3600);
    
    return NextResponse.json({
      success: true,
      url: signedUrl
    });
    
  } catch (error: any) {
    console.error('获取文档URL错误:', error);
    return NextResponse.json({
      success: false,
      error: `获取文档URL失败: ${error.message || '未知错误'}`
    }, { status: 500 });
  }
} 