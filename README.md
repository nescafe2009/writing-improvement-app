# 小赵作文助手

这是一款面向小学生的作文提升Web应用，旨在帮助小学生提高写作能力。

## 功能特点

- **首页**：学习数据看板和快速入口
- **AI智能助手**：提纲生成和写作建议
- **AI作文批改**：实时评价和修改建议
- **文档管理中心**：教师批改归档和对比分析
- **历史轨迹**：全流程文档回溯

## 技术栈

- 前端：React + TypeScript + Tailwind CSS
- 后端：Next.js API Routes + Firebase
- AI集成：Cuze API（写作场景专用模型）
- UI设计：符合Fluent Design System设计规范

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
/app                  # Next.js App Router
  /api                # API Routes
  /components         # 共享组件
  /modules            # 功能模块
  /styles             # 样式文件
  /utils              # 工具函数
/public               # 静态资源
/firebase             # Firebase配置
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
