'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthToken, isLoggedIn, getUserProfile } from '../../lib/client-auth';
import { checkAuthStatus, attemptAuthRepair, testCookieFunctionality, checkAuthDependencies } from '../../lib/auth-debug';

export default function DebugPage() {
  const [authToken, setAuthToken] = useState<string | undefined>('');
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [cookieExists, setCookieExists] = useState<boolean>(false);
  
  // 调试状态
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [cookieTest, setCookieTest] = useState<any>(null);
  const [repairResult, setRepairResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dependencyStatus, setDependencyStatus] = useState<any>(null);

  useEffect(() => {
    // 检查认证状态
    setLoggedIn(isLoggedIn());
    
    // 获取令牌
    const token = getAuthToken();
    setAuthToken(token);
    
    // 检查cookie中的令牌
    setCookieToken(document.cookie.includes('auth_token') ? '存在' : '不存在');
    setCookieExists(document.cookie.includes('auth_token'));
    
    // 检查localStorage中的令牌
    setLocalStorageToken(localStorage.getItem('auth_token'));
    
    // 获取用户资料
    setUserProfile(getUserProfile());
    
    // 运行认证状态诊断
    const status = checkAuthStatus();
    setAuthStatus(status);
    
    // 运行Cookie功能测试
    const test = testCookieFunctionality();
    setCookieTest(test);
    
    // 检查依赖状态
    try {
      const deps = checkAuthDependencies();
      setDependencyStatus(deps);
    } catch (error) {
      console.error('检查依赖状态时出错:', error);
    }
  }, []);

  // 显示Cookie详情
  const displayCookies = () => {
    return document.cookie.split(';').map((cookie, index) => (
      <div key={index} className="bg-gray-100 p-2 rounded mb-1">
        {cookie.trim()}
      </div>
    ));
  };
  
  // 尝试修复认证
  const handleRepair = async () => {
    setLoading(true);
    try {
      const result = attemptAuthRepair();
      setRepairResult(result);
      
      // 如果修复成功，更新页面状态
      if (result.success) {
        // 获取令牌
        const token = getAuthToken();
        setAuthToken(token);
        
        // 检查cookie中的令牌
        setCookieToken(document.cookie.includes('auth_token') ? '存在' : '不存在');
        setCookieExists(document.cookie.includes('auth_token'));
        
        // 检查localStorage中的令牌
        setLocalStorageToken(localStorage.getItem('auth_token'));
        
        // 检查认证状态
        setLoggedIn(isLoggedIn());
        
        // 运行认证状态诊断
        const status = checkAuthStatus();
        setAuthStatus(status);
      }
    } catch (error) {
      console.error('修复认证时出错:', error);
      setRepairResult({
        success: false,
        message: '修复认证时出错: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">认证调试页面</h1>
      <Link href="/" className="text-blue-600 hover:underline mb-6 block">
        返回首页
      </Link>
      
      {/* 认证状态卡片 */}
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">认证状态</h2>
        <p className="mb-2">
          <span className="font-medium">登录状态: </span>
          <span className={loggedIn ? "text-green-600" : "text-red-600"}>
            {loggedIn ? '已登录' : '未登录'}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">Auth Cookie: </span>
          <span className={cookieExists ? "text-green-600" : "text-red-600"}>
            {cookieToken}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">LocalStorage Token: </span>
          <span className={localStorageToken ? "text-green-600" : "text-red-600"}>
            {localStorageToken ? '存在' : '不存在'}
          </span>
        </p>
        
        {/* 修复按钮 */}
        <div className="mt-4">
          <button
            onClick={handleRepair}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? '修复中...' : '尝试修复认证问题'}
          </button>
          
          {repairResult && (
            <div className={`mt-3 p-3 rounded ${repairResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {repairResult.message}
            </div>
          )}
        </div>
      </div>
      
      {/* 详细状态信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2">认证令牌</h2>
          {authToken ? (
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <code>{authToken}</code>
            </div>
          ) : (
            <p className="text-red-600">未找到令牌</p>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2">用户资料</h2>
          {userProfile ? (
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">未找到用户资料</p>
          )}
        </div>
      </div>
      
      {/* 依赖状态检查 */}
      <div className="bg-white shadow-md rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">认证依赖状态</h2>
        {dependencyStatus ? (
          <div>
            <div className={`p-3 rounded mb-3 ${
              dependencyStatus.allDependenciesInstalled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <p className="font-medium">{dependencyStatus.message}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">依赖检查:</h3>
              <ul className="divide-y divide-gray-200">
                {dependencyStatus.dependencies.map((dep: any, index: number) => (
                  <li key={index} className="py-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dep.name}</span>
                      <span className={dep.installed ? "text-green-600" : "text-red-600"}>
                        {dep.installed ? '已安装' : '未安装'}
                      </span>
                    </div>
                    {dep.message && <p className="text-sm text-gray-600 mt-1">{dep.message}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>正在检查依赖状态...</p>
        )}
      </div>
      
      {/* 认证诊断 */}
      <div className="bg-white shadow-md rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">认证诊断</h2>
        {authStatus ? (
          <div>
            <div className={`p-3 rounded mb-3 ${
              authStatus.status === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <p className="font-medium">状态: {authStatus.status === 'authenticated' ? '已认证' : '未认证'}</p>
              <p>{authStatus.message}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-1">Cookie 检查:</h3>
                <ul className="list-disc list-inside">
                  <li className={authStatus.jsCookieFound ? "text-green-600" : "text-red-600"}>
                    js-cookie: {authStatus.jsCookieFound ? '找到' : '未找到'}
                  </li>
                  <li className={authStatus.documentCookieFound ? "text-green-600" : "text-red-600"}>
                    document.cookie: {authStatus.documentCookieFound ? '找到' : '未找到'}
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">本地存储检查:</h3>
                <p className={authStatus.localStorageFound ? "text-green-600" : "text-red-600"}>
                  localStorage: {authStatus.localStorageFound ? '找到' : '未找到'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p>正在加载诊断信息...</p>
        )}
      </div>
      
      {/* Cookie功能测试 */}
      <div className="bg-white shadow-md rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">Cookie 功能测试</h2>
        {cookieTest ? (
          <div>
            <div className={`p-3 rounded mb-3 ${cookieTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-medium">测试结果: {cookieTest.success ? '通过' : '失败'}</p>
              <p>{cookieTest.message}</p>
            </div>
            
            <div className="mt-3">
              <ul className="list-disc list-inside">
                <li className={cookieTest.jsCookieWorking ? "text-green-600" : "text-red-600"}>
                  js-cookie 功能: {cookieTest.jsCookieWorking ? '正常' : '异常'}
                </li>
                <li className={cookieTest.documentCookieWorking ? "text-green-600" : "text-red-600"}>
                  document.cookie 功能: {cookieTest.documentCookieWorking ? '正常' : '异常'}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <p>正在加载测试结果...</p>
        )}
      </div>
      
      {/* 所有 Cookie */}
      <div className="bg-white shadow-md rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">所有Cookie</h2>
        <div>
          {document.cookie ? displayCookies() : <p className="text-red-600">未找到Cookie</p>}
        </div>
      </div>
      
      {/* 故障排除 */}
      <div className="bg-white shadow-md rounded p-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">故障排除</h2>
        <ul className="list-disc pl-5">
          <li className="mb-2">如果您已登录但未显示令牌，请尝试重新登录。</li>
          <li className="mb-2">如果Cookie不存在，请检查浏览器设置是否允许Cookie。</li>
          <li className="mb-2">如果只有LocalStorage令牌存在，可能是Cookie保存失败，应用将回退到LocalStorage。</li>
          <li className="mb-2">如果遇到长时间登录问题，请清除浏览器缓存后重试。</li>
          <li className="mb-2">如果依赖检查显示某些库未安装，请联系管理员更新应用。</li>
        </ul>
        <div className="mt-4">
          <a 
            href="/login-guide.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span>查看完整登录指南</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 