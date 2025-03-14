import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 模拟用户数据存储路径
const USER_DATA_DIR = path.join(process.cwd(), 'data', 'users');
const MOCK_USER_ID = 'current-user'; // 简化示例，使用固定用户ID

// 确保数据目录存在
function ensureDirectoryExists() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }
}

// 获取用户数据文件路径
function getUserFilePath(userId: string) {
  return path.join(USER_DATA_DIR, `${userId}.json`);
}

// 读取用户数据
function readUserData(userId: string) {
  const filePath = getUserFilePath(userId);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
  // 返回默认用户数据 - 移除邮箱字段
  return {
    name: '小明',
    school: '实验小学',
    grade: '五年级',
    avatar: '',
  };
}

// 保存用户数据
function saveUserData(userId: string, userData: any) {
  ensureDirectoryExists();
  const filePath = getUserFilePath(userId);
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
}

// GET 请求处理 - 获取用户个人信息
export async function GET() {
  try {
    const userData = readUserData(MOCK_USER_ID);
    
    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户信息失败'
    }, { status: 500 });
  }
}

// POST 请求处理 - 更新用户个人信息
export async function POST(req: Request) {
  try {
    const userData = await req.json();
    
    // 验证数据有效性 - 只验证姓名
    if (!userData.name) {
      return NextResponse.json({
        success: false,
        error: '姓名不能为空'
      }, { status: 400 });
    }
    
    // 保存用户数据
    saveUserData(MOCK_USER_ID, userData);
    
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
} 