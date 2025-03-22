# Docker 部署指南

本文档提供使用 Docker 部署写作改进应用的详细步骤。

## 前提条件

确保服务器已安装以下软件：

- Docker (20.10.x 或更高版本)
- Docker Compose (2.x 或更高版本)
- Git (用于从代码仓库克隆项目)

## 部署步骤

### 1. 克隆代码仓库

```bash
git clone <仓库URL> writing-improvement-app
cd writing-improvement-app
```

### 2. 配置环境变量

```bash
# 复制示例环境变量文件
cp .env.example .env.local

# 使用编辑器修改环境变量
nano .env.local
# 或
vim .env.local
```

请确保填写所有必要的API密钥和配置信息，特别是：
- Firebase配置
- 腾讯云对象存储（COS）配置
- DeepSeek API密钥
- 豆包API配置

### 3. 构建并启动容器

使用Docker Compose构建并启动应用：

```bash
# 构建镜像
docker-compose build

# 启动容器（后台运行）
docker-compose up -d
```

应用将在 http://服务器IP:3000 上运行。

## 管理容器

### 查看容器状态和日志

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs

# 查看实时日志
docker-compose logs -f

# 查看特定数量的日志行
docker-compose logs --tail=100
```

### 重启、停止和删除容器

```bash
# 重启容器
docker-compose restart

# 停止容器（保留数据）
docker-compose stop

# 停止并删除容器（但保留卷）
docker-compose down

# 停止并删除容器和卷（完全清理，将丢失数据）
docker-compose down -v
```

## 更新应用

要更新应用到最新版本：

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启容器
docker-compose up -d
```

## 数据持久化

应用数据存储在名为 `app-data` 的Docker卷中。这确保容器重启后数据不会丢失。

查看卷信息：
```bash
docker volume ls
```

备份卷数据：
```bash
# 创建一个临时容器访问卷并备份数据
docker run --rm -v app-data:/data -v $(pwd):/backup alpine tar -czf /backup/app-data-backup.tar.gz /data
```

恢复卷数据：
```bash
# 从备份文件恢复数据到卷
docker run --rm -v app-data:/data -v $(pwd):/backup alpine sh -c "rm -rf /data/* && tar -xzf /backup/app-data-backup.tar.gz -C /"
```

## 故障排除

1. 如果应用无法启动，检查容器日志：
   ```bash
   docker-compose logs writing-improvement-app
   ```

2. 如果遇到环境变量问题，确认 `.env.local` 文件存在且格式正确：
   ```bash
   cat .env.local
   ```

3. 检查容器是否健康：
   ```bash
   docker inspect --format='{{json .State.Health}}' writing-improvement-app
   ```

4. 如果需要进入容器调试：
   ```bash
   docker-compose exec writing-improvement-app sh
   ```

5. 检查网络连接：
   ```bash
   docker-compose exec writing-improvement-app wget -O- http://localhost:3000
   ``` 