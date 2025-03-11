import { NextResponse } from 'next/server';
import { cos, cosConfig } from '@/config/cos';

export async function DELETE(request: Request) {
  try {
    // 从请求URL中获取filePath参数
    const url = new URL(request.url);
    const filePath = url.searchParams.get('filePath');
    
    if (!filePath) {
      return NextResponse.json(
        { error: '缺少文件路径参数' },
        { status: 400 }
      );
    }
    
    console.log(`正在删除文件: ${filePath}`);
    
    // 从腾讯云COS中删除文件
    const deleteResult = await new Promise((resolve, reject) => {
      cos.deleteObject({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: filePath,
      }, (err, data) => {
        if (err) {
          console.error(`删除文件失败: ${filePath}`, err);
          reject(err);
        } else {
          console.log(`文件删除成功: ${filePath}`, data);
          resolve(data);
        }
      });
    });
    
    return NextResponse.json({
      success: true,
      message: '文件已成功删除',
      filePath: filePath,
    });
  } catch (error: any) {
    console.error('删除文件错误:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '删除文件失败: ' + (error.message || '未知错误'),
        details: error.toString()
      },
      { status: 500 }
    );
  }
} 