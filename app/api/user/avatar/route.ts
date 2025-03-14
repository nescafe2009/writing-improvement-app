import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 头像存储目录
const AVATAR_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const MOCK_USER_ID = 'current-user'; // 简化示例，使用固定用户ID

// 确保头像目录存在
async function ensureAvatarDirectoryExists() {
  if (!existsSync(AVATAR_DIRECTORY)) {
    await mkdir(AVATAR_DIRECTORY, { recursive: true });
  }
}

// 更新用户数据中的头像路径
async function updateUserAvatarPath(userId: string, avatarPath: string) {
  try {
    const userDataPath = path.join(process.cwd(), 'data', 'users', `${userId}.json`);
    
    // 确保用户数据目录存在
    const userDataDir = path.dirname(userDataPath);
    if (!existsSync(userDataDir)) {
      await mkdir(userDataDir, { recursive: true });
    }
    
    // 读取现有用户数据或创建新数据
    let userData = {
      name: '小明',
      school: '实验小学',
      grade: '五年级',
      avatar: '',
    };
    
    if (existsSync(userDataPath)) {
      const fileContent = await readFile(userDataPath, 'utf8');
      userData = JSON.parse(fileContent);
    }
    
    // 更新头像路径
    userData.avatar = avatarPath;
    
    // 保存用户数据
    await writeFile(userDataPath, JSON.stringify(userData, null, 2));
    
    return true;
  } catch (error) {
    console.error('更新用户头像路径失败:', error);
    return false;
  }
}

// POST 请求处理 - 上传头像
export async function POST(req: Request) {
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
    const fileName = `${MOCK_USER_ID}-${uuidv4()}.${fileExtension}`;
    const filePath = path.join(AVATAR_DIRECTORY, fileName);
    
    // 保存文件
    await writeFile(filePath, fileBuffer);
    
    // 生成可访问的URL路径
    const avatarUrl = `/uploads/avatars/${fileName}`;
    
    // 更新用户数据中的头像路径
    await updateUserAvatarPath(MOCK_USER_ID, avatarUrl);
    
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
} 