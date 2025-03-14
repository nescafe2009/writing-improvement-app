/**
 * 认证调试工具 - 用于诊断和修复认证问题
 */

import Cookies from 'js-cookie';
import { getAuthToken, setAuthToken, clearAuthToken } from './client-auth';

// 定义认证状态返回类型
type AuthStatusResult = {
  status: 'authenticated' | 'unauthenticated' | 'error' | 'server';
  jsCookieFound?: boolean;
  documentCookieFound?: boolean;
  localStorageFound?: boolean;
  jsCookieToken?: string | null;
  localStorageToken?: string | null;
  currentAuthToken?: string | null;
  cookieState?: string;
  message: string;
};

// 定义依赖状态类型
type DependencyStatus = {
  name: string;
  installed: boolean;
  message?: string;
};

// 定义依赖检查结果类型
type DependencyCheckResult = {
  allDependenciesInstalled: boolean;
  dependencies: DependencyStatus[];
  message: string;
};

// 检查认证所需的依赖状态
export function checkAuthDependencies(): DependencyCheckResult {
  const dependencies: DependencyStatus[] = [];
  let allInstalled = true;
  
  // 检查js-cookie
  try {
    // 验证js-cookie可用
    const jsCookieInstalled = typeof Cookies !== 'undefined';
    dependencies.push({
      name: 'js-cookie',
      installed: jsCookieInstalled,
      message: jsCookieInstalled ? '已安装' : '未安装'
    });
    
    if (!jsCookieInstalled) allInstalled = false;
  } catch (error) {
    dependencies.push({
      name: 'js-cookie',
      installed: false,
      message: '检查时出错: ' + (error instanceof Error ? error.message : String(error))
    });
    allInstalled = false;
  }
  
  // 检查bcryptjs (仅在服务器端使用，但用try引入检查)
  try {
    // 动态引入模块检查是否可用
    const bcryptInstalled = typeof require('bcryptjs') !== 'undefined';
    dependencies.push({
      name: 'bcryptjs',
      installed: bcryptInstalled,
      message: bcryptInstalled ? '已安装' : '未安装'
    });
    
    if (!bcryptInstalled) allInstalled = false;
  } catch (error) {
    dependencies.push({
      name: 'bcryptjs',
      installed: false,
      message: '检查时出错: 服务器端依赖，客户端无法验证'
    });
    // 不影响allInstalled标志，因为客户端无法准确验证
  }
  
  // 检查jsonwebtoken (仅在服务器端使用，但用try引入检查)
  try {
    // 动态引入模块检查是否可用
    const jwtInstalled = typeof require('jsonwebtoken') !== 'undefined';
    dependencies.push({
      name: 'jsonwebtoken',
      installed: jwtInstalled,
      message: jwtInstalled ? '已安装' : '未安装'
    });
    
    if (!jwtInstalled) allInstalled = false;
  } catch (error) {
    dependencies.push({
      name: 'jsonwebtoken',
      installed: false,
      message: '检查时出错: 服务器端依赖，客户端无法验证'
    });
    // 不影响allInstalled标志，因为客户端无法准确验证
  }
  
  return {
    allDependenciesInstalled: allInstalled,
    dependencies,
    message: allInstalled ? 
      '所有客户端认证依赖已正确安装' : 
      '部分认证依赖可能未正确安装，这可能影响认证功能'
  };
}

// 检查认证状态并返回详细诊断
export function checkAuthStatus(): AuthStatusResult {
  if (typeof window === 'undefined') {
    return { status: 'server', message: '此函数只能在客户端运行' };
  }

  try {
    // 获取所有可用的认证信息
    const jsCookieToken = Cookies.get('auth_token');
    const documentCookies = document.cookie;
    const hasCookieInDocument = documentCookies.includes('auth_token');
    const localStorageToken = localStorage.getItem('auth_token');
    const authToken = getAuthToken();
    
    const results: AuthStatusResult = {
      status: authToken ? 'authenticated' : 'unauthenticated',
      jsCookieFound: !!jsCookieToken,
      documentCookieFound: hasCookieInDocument,
      localStorageFound: !!localStorageToken,
      jsCookieToken: jsCookieToken || null,
      localStorageToken: localStorageToken || null,
      currentAuthToken: authToken || null,
      cookieState: documentCookies || '(空)',
      message: ''
    };
    
    // 诊断可能的问题
    if (!authToken) {
      if (!jsCookieToken && !localStorageToken) {
        results.message = '未找到任何认证令牌，可能未登录或令牌已过期';
      } else if (!jsCookieToken && localStorageToken) {
        results.message = 'Cookie未设置但localStorage中有令牌，可能是Cookie设置失败';
      } else if (jsCookieToken && !localStorageToken) {
        results.message = 'Cookie中有令牌但localStorage中没有，可能是localStorage清除了';
      }
    } else {
      results.message = '认证令牌有效';
    }
    
    return results;
  } catch (error) {
    return {
      status: 'error',
      message: `检查认证状态时出错: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// 定义修复结果类型
type RepairResult = {
  success: boolean;
  message: string;
  token?: string;
  details?: AuthStatusResult;
};

// 尝试修复认证问题
export function attemptAuthRepair(): RepairResult {
  if (typeof window === 'undefined') {
    return { success: false, message: '此函数只能在客户端运行' };
  }
  
  try {
    const status = checkAuthStatus();
    
    // 如果已经通过认证，不需要修复
    if (status.status === 'authenticated') {
      return { success: true, message: '认证状态正常，无需修复' };
    }
    
    // 尝试从任一有效来源恢复令牌
    const token = status.jsCookieToken || status.localStorageToken;
    
    if (token) {
      // 清除所有现有令牌，然后重新设置
      clearAuthToken();
      setAuthToken(token);
      
      // 验证修复是否成功
      const newStatus = checkAuthStatus();
      if (newStatus.status === 'authenticated') {
        return { success: true, message: '认证已修复', token };
      } else {
        return { success: false, message: '尝试修复认证失败', details: newStatus };
      }
    }
    
    return { success: false, message: '无法修复认证，未找到有效令牌' };
  } catch (error) {
    return { 
      success: false, 
      message: `尝试修复认证时出错: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// 定义Cookie测试结果类型
type CookieTestResult = {
  success: boolean;
  jsCookieWorking?: boolean;
  documentCookieWorking?: boolean;
  message: string;
};

// 检查Cookie功能是否正常
export function testCookieFunctionality(): CookieTestResult {
  if (typeof window === 'undefined') {
    return { success: false, message: '此函数只能在客户端运行' };
  }
  
  try {
    // 测试Cookie设置
    const testValue = `test-${Date.now()}`;
    Cookies.set('auth_test', testValue, { path: '/' });
    
    // 检查是否设置成功
    const retrievedValue = Cookies.get('auth_test');
    const cookieInDocument = document.cookie.includes('auth_test');
    
    // 清理测试Cookie
    Cookies.remove('auth_test', { path: '/' });
    
    return {
      success: retrievedValue === testValue,
      jsCookieWorking: retrievedValue === testValue,
      documentCookieWorking: cookieInDocument,
      message: retrievedValue === testValue ? 
        'Cookie功能正常' : 
        'Cookie设置失败，浏览器可能禁止了Cookie'
    };
  } catch (error) {
    return { 
      success: false, 
      message: `测试Cookie功能时出错: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
} 