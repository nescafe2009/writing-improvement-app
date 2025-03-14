import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, verifyPassword, generateToken, updateUser } from '../utils';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 });
    }
    
    // 获取用户信息
    const user = getUser(username);
    
    // 用户不存在
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 });
    }
    
    // 验证密码
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 });
    }
    
    // 更新最后登录时间
    updateUser(username, { lastLogin: new Date().toISOString() });
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    // 设置cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7天
      sameSite: 'strict'
    });
    
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({
      success: false,
      error: '登录过程中发生错误'
    }, { status: 500 });
  }
} 