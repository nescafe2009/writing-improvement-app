FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖阶段
FROM base AS deps
# 安装libc6-compat，这是一些Node包可能需要的
RUN apk add --no-cache libc6-compat

# 复制package.json和package-lock.json
COPY package.json package-lock.json* ./
# 安装依赖（使用legacy-peer-deps解决依赖冲突）
RUN npm ci --legacy-peer-deps

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 添加环境变量配置
ARG NEXT_DISABLE_ESLINT=1
ENV NEXT_DISABLE_ESLINT=$NEXT_DISABLE_ESLINT

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 创建非root用户运行应用
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 复制构建的应用和必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 暴露3000端口
EXPOSE 3000

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["node", "server.js"] 