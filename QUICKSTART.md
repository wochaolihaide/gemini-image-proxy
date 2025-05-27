# 🚀 快速开始指南

这是一个 5 分钟快速部署指南，让你快速体验 Gemini 图像生成器。

## 📋 前置要求

- Node.js 18+ 
- Gemini API Key（[获取方法](#获取-api-key)）

## ⚡ 本地快速体验

### 1. 下载项目

```bash
# 方法一：使用 git clone
git clone https://github.com/your-username/gemini-image-proxy.git
cd gemini-image-proxy

# 方法二：下载 ZIP 并解压
# 然后进入项目目录
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，添加你的 API Key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. 测试 API 连接

```bash
npm run test
```

如果看到 ✅ 成功消息，说明配置正确！

### 5. 启动服务

```bash
npm start
```

### 6. 访问应用

打开浏览器访问：`http://localhost:3000`

## 🌐 一键云端部署

### Vercel 部署（推荐）

1. **Fork 本仓库**到你的 GitHub
2. **访问** [Vercel](https://vercel.com/)
3. **导入**你的仓库
4. **设置环境变量**：`GEMINI_API_KEY`
5. **点击部署**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gemini-image-proxy&env=GEMINI_API_KEY)

### Railway 部署

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway variables set GEMINI_API_KEY=your_api_key
railway up
```

## 🔑 获取 API Key

### 步骤 1：访问 Google AI Studio

前往 [Google AI Studio](https://aistudio.google.com/)

### 步骤 2：登录账户

使用你的 Google 账户登录

### 步骤 3：创建 API Key

1. 点击左侧菜单的 "Get API key"
2. 点击 "Create API key"
3. 选择项目或创建新项目
4. 复制生成的 API Key

### 步骤 4：验证 API Key

```bash
# 在项目目录中运行测试
npm run test
```

> **💡 提示**：如果你在不支持的地区，可以使用 VPN 获取 API Key

## 📱 使用指南

### 1. 上传图片

- 拖拽图片到上传区域
- 或点击选择文件
- 支持 JPG、PNG、GIF 格式

### 2. 输入提示词

- 在文本框中输入描述
- 可以添加多个提示词
- 每个提示词会生成独立的图片

### 3. 设置参数

- 选择每个提示词生成的图片数量
- 点击"开始生成"

### 4. 查看结果

- 生成的图片会显示在对应提示词下方
- 可以预览、下载图片
- 支持继续生成更多图片

## 🔧 常见问题

### Q: API Key 无效怎么办？

A: 检查以下几点：
- API Key 是否正确复制
- 是否在 Google AI Studio 中激活
- 网络连接是否正常

### Q: 生成失败怎么办？

A: 可能的原因：
- 图片格式不支持
- 提示词过于复杂
- API 配额不足
- 网络连接问题

### Q: 如何修改生成参数？

A: 可以在代码中调整：
- 图片数量限制
- 文件大小限制
- 速率限制设置

### Q: 支持哪些图片格式？

A: 目前支持：
- JPG/JPEG
- PNG
- GIF
- 最大 10MB

## 🛠️ 自定义配置

### 环境变量

```bash
# 基础配置
GEMINI_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=production

# 高级配置
MAX_FILE_SIZE=10485760  # 10MB
RATE_LIMIT_POINTS=10    # 每分钟请求数
RATE_LIMIT_DURATION=60  # 时间窗口（秒）
```

### 修改界面

编辑 `public/` 目录下的文件：
- `index.html` - 页面结构
- `styles.css` - 样式设计
- `script.js` - 交互逻辑

### 修改 API

编辑 `api/` 目录下的文件：
- `generate.js` - 主要生成逻辑
- `download/[filename].js` - 文件下载

## 📚 进阶使用

### 集成到现有项目

```javascript
// 使用 API 端点
const response = await fetch('/api/generate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### 自定义模型参数

```javascript
// 在 api/generate.js 中修改
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,  // 创造性
    topK: 40,         // 候选词数量
    topP: 0.95,       // 累积概率
    maxOutputTokens: 8192,
  }
});
```

## 🔄 更新项目

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 重启服务
npm start
```

## 📞 获取帮助

- 📖 查看完整文档：[README.md](README.md)
- 🚀 部署指南：[DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 报告问题：[GitHub Issues](https://github.com/your-username/gemini-image-proxy/issues)
- 💬 讨论交流：[GitHub Discussions](https://github.com/your-username/gemini-image-proxy/discussions)

---

**🎉 现在你已经成功运行了 Gemini 图像生成器！开始创作吧！** 