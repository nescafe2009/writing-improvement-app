/**
 * 客户端认证工具 - 提供前端认证相关功能
 */

import Cookies from 'js-cookie';

// 用户资料类型定义
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  [key: string]: any;
}

// Cookie相关配置
const AUTH_TOKEN_NAME = 'auth_token';
const USER_PROFILE_NAME = 'user_profile';
const COOKIE_OPTIONS = { path: '/', expires: 7 }; // 7天过期

/**
 * 获取认证令牌
 * @returns 认证令牌或undefined
 */
export function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // 首选从Cookie获取
  const token = Cookies.get(AUTH_TOKEN_NAME);
  if (token) return token;
  
  // 后备：尝试从localStorage获取
  try {
    return localStorage.getItem(AUTH_TOKEN_NAME) || undefined;
  } catch (e) {
    console.error('从localStorage获取令牌时出错:', e);
    return undefined;
  }
}

/**
 * 设置认证令牌
 * @param token 要设置的令牌
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // 同时设置在Cookie和localStorage中作为备份
    Cookies.set(AUTH_TOKEN_NAME, token, COOKIE_OPTIONS);
    localStorage.setItem(AUTH_TOKEN_NAME, token);
  } catch (e) {
    console.error('设置认证令牌时出错:', e);
  }
}

/**
 * 清除认证令牌
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // 从Cookie和localStorage中移除
    Cookies.remove(AUTH_TOKEN_NAME, { path: '/' });
    localStorage.removeItem(AUTH_TOKEN_NAME);
  } catch (e) {
    console.error('清除认证令牌时出错:', e);
  }
}

/**
 * 设置用户资料
 * @param profile 用户资料对象
 */
export function setUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_PROFILE_NAME, JSON.stringify(profile));
  } catch (e) {
    console.error('设置用户资料时出错:', e);
  }
}

/**
 * 获取用户资料
 * @returns 用户资料对象或null
 */
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const profileJson = localStorage.getItem(USER_PROFILE_NAME);
    if (!profileJson) return null;
    return JSON.parse(profileJson) as UserProfile;
  } catch (e) {
    console.error('获取用户资料时出错:', e);
    return null;
  }
}

/**
 * 清除用户资料
 */
export function clearUserProfile(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_PROFILE_NAME);
  } catch (e) {
    console.error('清除用户资料时出错:', e);
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getAuthToken();
}

/**
 * 注销用户
 */
export function logout(): void {
  clearAuthToken();
  clearUserProfile();
}

/**
 * 为API请求获取认证头
 * @returns 带认证信息的请求头对象
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
} 