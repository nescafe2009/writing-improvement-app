import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 删除认证cookie
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    
    return NextResponse.json({
      success: true,
      message: '已成功退出登录'
    });
  } catch (error) {
    console.error('退出登录失败:', error);
    return NextResponse.json({
      success: false,
      error: '退出登录过程中发生错误'
    }, { status: 500 });
  }
} 