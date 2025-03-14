import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './utils';

// 获取当前用户名
export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  return payload?.username || null;
}

// 鉴权中间件函数
export async function withAuth(req: Request, callback: (username: string) => Promise<NextResponse>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({
      success: false,
      error: '未登录'
    }, { status: 401 });
  }
  
  const payload = verifyToken(token);
  
  if (!payload || !payload.username) {
    return NextResponse.json({
      success: false,
      error: '无效的凭证'
    }, { status: 401 });
  }
  
  // 调用传入的回调函数处理请求
  return callback(payload.username);
} 