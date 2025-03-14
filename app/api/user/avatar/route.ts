import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { withAuth } from '../../auth/middleware';
import { updateUser } from '../../auth/utils';

// 头像存储目录
const AVATAR_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'avatars');

// 确保头像目录存在
async function ensureAvatarDirectoryExists() {
  if (!existsSync(AVATAR_DIRECTORY)) {
    await mkdir(AVATAR_DIRECTORY, { recursive: true });
  }
}

// POST 请求处理 - 上传头像
export async function POST(req: Request) {
  return withAuth(req, async (username) => {
    try {
      // 确保头像目录存在
      await ensureAvatarDirectoryExists();
      
      // 获取表单数据
      const formData = await req.formData();
      const file = formData.get('avatar') as File;
      
      if (!file) {
        return NextResponse.json({
          success: false,
          error: '没有找到上传的文件'
        }, { status: 400 });
      }
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({
          success: false,
          error: '只支持图片文件'
        }, { status: 400 });
      }
      
      // 限制文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: '文件大小不能超过5MB'
        }, { status: 400 });
      }
      
      // 读取文件内容
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      
      // 生成文件名和路径
      const fileExtension = file.type.split('/')[1] || 'jpg';
      const fileName = `${username}-${uuidv4()}.${fileExtension}`;
      const filePath = path.join(AVATAR_DIRECTORY, fileName);
      
      // 保存文件
      await writeFile(filePath, fileBuffer);
      
      // 生成可访问的URL路径
      const avatarUrl = `/uploads/avatars/${fileName}`;
      
      // 更新用户数据中的头像路径
      const updated = updateUser(username, { avatar: avatarUrl });
      
      if (!updated) {
        return NextResponse.json({
          success: false,
          error: '更新用户头像失败'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        avatarUrl,
        message: '头像上传成功'
      });
    } catch (error) {
      console.error('头像上传失败:', error);
      return NextResponse.json({
        success: false,
        error: '头像上传失败'
      }, { status: 500 });
    }
  });
} 