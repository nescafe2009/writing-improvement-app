import { NextResponse } from 'next/server';
import { withAuth } from '../middleware';
import { getUser } from '../utils';

export async function GET(req: Request) {
  return withAuth(req, async (username) => {
    try {
      // 获取用户信息
      const user = getUser(username);
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: '用户不存在'
        }, { status: 404 });
      }
      
      // 返回安全的用户信息（排除密码哈希等敏感信息）
      return NextResponse.json({
        success: true,
        user: {
          username: user.username,
          name: user.name,
          school: user.school,
          grade: user.grade,
          avatar: user.avatar,
          lastLogin: user.lastLogin
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