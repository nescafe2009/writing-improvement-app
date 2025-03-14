import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// 存储用户数据的目录
const USERS_DIR = path.join(process.cwd(), 'data', 'users');

// JWT密钥 (生产环境中应该使用环境变量)
const JWT_SECRET = 'your-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token有效期

// 确保用户数据目录存在
export function ensureUserDirectoryExists() {
  if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
  }
}

// 用户数据文件路径
export function getUserDataPath(username: string) {
  return path.join(USERS_DIR, `${username.toLowerCase()}.json`);
}

// 检查用户是否存在
export function userExists(username: string): boolean {
  return fs.existsSync(getUserDataPath(username));
}

// 哈希密码
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// 验证密码
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, storedHash] = hashedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
}

// 用户接口
export interface User {
  username: string;
  passwordHash: string;
  name: string;
  school: string;
  grade: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
}

// 创建新用户
export function createUser(username: string, password: string, name: string = ''): User {
  const newUser: User = {
    username,
    passwordHash: hashPassword(password),
    name: name || username,
    school: '',
    grade: '',
    avatar: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  ensureUserDirectoryExists();
  fs.writeFileSync(getUserDataPath(username), JSON.stringify(newUser, null, 2));
  
  return newUser;
}

// 获取用户信息
export function getUser(username: string): User | null {
  try {
    const filePath = getUserDataPath(username);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return userData;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 更新用户信息
export function updateUser(username: string, userData: Partial<User>): boolean {
  try {
    const user = getUser(username);
    
    if (!user) {
      return false;
    }
    
    // 更新用户数据
    const updatedUser = {
      ...user,
      ...userData,
      username: user.username, // 不允许更改用户名
      passwordHash: userData.passwordHash || user.passwordHash // 只有明确提供才更新密码
    };
    
    fs.writeFileSync(getUserDataPath(username), JSON.stringify(updatedUser, null, 2));
    
    return true;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return false;
  }
}

// 生成JWT令牌
export function generateToken(user: User): string {
  const payload = {
    sub: user.username,
    name: user.name,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证JWT令牌
export function verifyToken(token: string): { username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { username: (decoded as any).sub };
  } catch (error) {
    return null;
  }
} 