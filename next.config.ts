import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // 启用独立输出模式，优化Docker部署
  eslint: {
    ignoreDuringBuilds: true, // 构建时忽略ESLint错误
  },
};

export default nextConfig;
