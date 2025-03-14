'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6 sm:py-8">
      <div className="w-full max-w-md mx-auto">
        {/* 欢迎卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* 顶部装饰条 */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="px-6 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10">
            {/* 标题和品牌 */}
            <div className="text-center mb-6 sm:mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 mb-4 sm:mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">小赵作文助手</h2>
              <p className="text-gray-500 text-sm sm:text-base">欢迎使用作文写作辅助工具</p>
            </div>

            {/* 内容区域 */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                作文助手可以帮助您改进写作技巧，提高作文质量。
              </p>
              <p className="text-gray-600">
                开始使用之前，请先了解本工具的主要功能。
              </p>
            </div>
            
            {/* 功能按钮 */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/writing" 
                className="flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-sm">
                开始写作
              </Link>
              
              <Link href="/guide" 
                className="flex justify-center py-3 px-4 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-sm">
                使用指南
              </Link>
            </div>
            
            {/* 功能列表 */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">主要功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>智能语法检查与纠正</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>作文结构建议与优化</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>词汇丰富度与表达多样性增强</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>情感与论点分析</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 页脚 */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>小赵作文助手 © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
} 