import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取响应对象
  const response = NextResponse.next();
  
  // 打印当前请求的cookie，用于调试
  const cookies = request.cookies.getAll();
  if (cookies.length > 0) {
    console.log('请求中的cookie:', cookies.map(c => `${c.name}=${c.value}`).join('; '));
  } else {
    console.log('请求中没有cookie');
  }
  
  // 记录当前访问的路径
  console.log('访问路径:', request.nextUrl.pathname);
  
  // 不要手动设置 Set-Cookie 头，应该让 Next.js 处理 cookie
  // 移除这行可能导致问题的代码
  // response.headers.set('Set-Cookie', 'SameSite=Lax; Secure');
  
  return response;
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    // 应用于所有API路由
    '/api/:path*',
    // 排除静态资源和图片
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 