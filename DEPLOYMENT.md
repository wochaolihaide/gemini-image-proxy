# 部署指南

本文档详细介绍了如何将 Gemini 图像生成器部署到各种平台。

## 🎯 核心要求

在开始部署之前，请确保你有：

1. **Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/) 获取
2. **GitHub 账户**: 用于代码托管
3. **部署平台账户**: Vercel、Railway、Render 等

## 🚀 Vercel 部署（推荐）

Vercel 是最推荐的部署平台，因为它：
- 免费额度充足
- 支持 Serverless Functions
- 自动 HTTPS 和 CDN
- 部署简单快速

### 步骤 1: 准备代码

1. Fork 本仓库到你的 GitHub 账户
2. 或者下载代码并推送到你的仓库

### 步骤 2: 连接 Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 选择你的仓库

### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加环境变量：

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 步骤 4: 部署

1. 点击 "Deploy"
2. 等待部署完成
3. 访问提供的 URL

### 自动部署按钮

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gemini-image-proxy&env=GEMINI_API_KEY&envDescription=Your%20Gemini%20API%20key%20from%20Google%20AI%20Studio)

## 🚂 Railway 部署

Railway 提供简单的容器化部署：

### 步骤 1: 安装 CLI

```bash
npm install -g @railway/cli
```

### 步骤 2: 登录和初始化

```bash
railway login
railway init
```

### 步骤 3: 设置环境变量

```bash
railway variables set GEMINI_API_KEY=your_api_key_here
```

### 步骤 4: 部署

```bash
railway up
```

## 🎨 Render 部署

Render 提供免费的 Web 服务：

### 步骤 1: 连接仓库

1. 访问 [Render](https://render.com/)
2. 创建新的 Web Service
3. 连接你的 GitHub 仓库

### 步骤 2: 配置设置

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18 或更高

### 步骤 3: 环境变量

添加环境变量：
```
GEMINI_API_KEY=your_api_key_here
```

## 🖥️ 自建服务器部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 克隆代码
git clone https://github.com/your-username/gemini-image-proxy.git
cd gemini-image-proxy

# 安装依赖
npm install

# 设置环境变量
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 启动服务
pm2 start npm --name "gemini-proxy" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 使用 Docker

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

构建和运行：

```bash
# 构建镜像
docker build -t gemini-image-proxy .

# 运行容器
docker run -d \
  --name gemini-proxy \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  gemini-image-proxy
```

## ☁️ 云平台部署

### AWS Lambda

使用 Serverless Framework：

```bash
npm install -g serverless
serverless create --template aws-nodejs --path gemini-proxy
```

### Google Cloud Run

```bash
# 构建并推送到 Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/gemini-proxy

# 部署到 Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/gemini-proxy \
  --set-env-vars GEMINI_API_KEY=your_api_key_here
```

### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name gemini-proxy \
  --image your-registry/gemini-proxy \
  --environment-variables GEMINI_API_KEY=your_api_key_here \
  --ports 3000
```

## 🔧 配置优化

### 环境变量

除了必需的 `GEMINI_API_KEY`，你还可以设置：

```bash
# 端口设置
PORT=3000

# 环境模式
NODE_ENV=production

# 日志级别
LOG_LEVEL=info

# 文件上传限制（字节）
MAX_FILE_SIZE=10485760

# 速率限制
RATE_LIMIT_POINTS=10
RATE_LIMIT_DURATION=60
```

### 性能优化

1. **启用 Gzip 压缩**
2. **设置适当的缓存头**
3. **使用 CDN 加速静态资源**
4. **监控内存使用情况**

### 安全配置

1. **设置 CORS 策略**
2. **启用 HTTPS**
3. **隐藏服务器信息**
4. **实施速率限制**

## 🔍 故障排除

### 常见部署问题

1. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version
   
   # 清理缓存
   npm cache clean --force
   ```

2. **环境变量未生效**
   ```bash
   # 验证环境变量
   echo $GEMINI_API_KEY
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   ```

4. **内存不足**
   ```bash
   # 监控内存使用
   free -h
   top
   ```

### 日志调试

启用详细日志：

```bash
NODE_ENV=development npm start
```

查看 PM2 日志：

```bash
pm2 logs gemini-proxy
```

## 📊 监控和维护

### 健康检查

添加健康检查端点：

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 监控工具

推荐使用：
- **Uptime Robot**: 服务可用性监控
- **New Relic**: 性能监控
- **Sentry**: 错误追踪
- **LogRocket**: 用户行为分析

### 备份策略

1. **代码备份**: 使用 Git 版本控制
2. **配置备份**: 导出环境变量
3. **数据备份**: 定期备份生成的文件

## 🔄 更新部署

### 自动部署

设置 GitHub Actions：

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 手动更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重启服务
pm2 restart gemini-proxy
```

## 📞 获取帮助

如果在部署过程中遇到问题：

1. 查看项目的 [Issues](https://github.com/your-username/gemini-image-proxy/issues)
2. 查阅平台官方文档
3. 在社区论坛寻求帮助
4. 创建新的 Issue 描述问题

---

**祝你部署顺利！🎉** 