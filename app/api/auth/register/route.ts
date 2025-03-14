import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createUser, generateToken, userExists } from '../utils';

export async function POST(req: Request) {
  try {
    const { username, password, name } = await req.json();
    
    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 });
    }
    
    // 检查用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        success: false,
        error: '用户名长度必须在3-20个字符之间'
      }, { status: 400 });
    }
    
    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密码长度不能少于6个字符'
      }, { status: 400 });
    }
    
    // 检查用户名是否已存在
    if (userExists(username)) {
      return NextResponse.json({
        success: false,
        error: '该用户名已被注册'
      }, { status: 409 });
    }
    
    // 创建新用户
    const user = createUser(username, password, name);
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    // 设置cookie
    cookies().set({
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
    console.error('注册失败:', error);
    return NextResponse.json({
      success: false,
      error: '注册过程中发生错误'
    }, { status: 500 });
  }
} 