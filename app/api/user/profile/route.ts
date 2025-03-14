import { NextResponse } from 'next/server';
import { withAuth } from '../../auth/middleware';
import { getUser, updateUser } from '../../auth/utils';

// GET 请求处理 - 获取用户个人信息
export async function GET(req: Request) {
  return withAuth(req, async (username) => {
    try {
      // 获取用户信息
      const userData = getUser(username);
      
      if (!userData) {
        return NextResponse.json({
          success: false,
          error: '获取用户信息失败'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        user: {
          name: userData.name,
          school: userData.school,
          grade: userData.grade,
          avatar: userData.avatar
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return NextResponse.json({
        success: false,
        error: '获取用户信息失败'
      }, { status: 500 });
    }
  });
}

// POST 请求处理 - 更新用户个人信息
export async function POST(req: Request) {
  return withAuth(req, async (username) => {
    try {
      const userData = await req.json();
      
      // 验证数据有效性 - 只验证姓名
      if (!userData.name) {
        return NextResponse.json({
          success: false,
          error: '姓名不能为空'
        }, { status: 400 });
      }
      
      // 更新用户数据
      const updated = updateUser(username, {
        name: userData.name,
        school: userData.school || '',
        grade: userData.grade || '',
      });
      
      if (!updated) {
        return NextResponse.json({
          success: false,
          error: '更新用户信息失败'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: '个人信息已更新'
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return NextResponse.json({
        success: false,
        error: '更新用户信息失败'
      }, { status: 500 });
    }
  });
} 