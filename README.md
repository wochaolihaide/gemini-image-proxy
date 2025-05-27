# Gemini 图像生成器

基于 Gemini 2.0 Flash 的智能图像生成服务，专为中国用户设计的API中转解决方案。

## 🌟 特性

- ✅ **Gemini API 中转**: 解决中国境内访问限制问题
- 🖼️ **图像生成**: 支持 `gemini-2.0-flash-exp-image-generation` 模型
- 📱 **现代化界面**: 苹果风格的简洁优美设计
- 🎯 **多提示词支持**: 可同时处理多个提示词生成
- 📊 **进度显示**: 实时显示生成进度和剩余时间
- 🚦 **速率限制**: 每分钟最多10次请求，防止滥用
- 💾 **文件管理**: 规范的文件保存和下载功能
- 🔄 **继续生成**: 支持基于现有结果继续生成

## 🚀 快速开始

### 方法一：部署到 Vercel（推荐）

1. **Fork 本仓库**
2. **在 Vercel 中导入项目**
3. **设置环境变量**：
   - `GEMINI_API_KEY`: 你的 Gemini API 密钥
4. **部署完成**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gemini-image-proxy)

### 方法二：本地运行

1. **克隆仓库**
```bash
git clone https://github.com/your-username/gemini-image-proxy.git
cd gemini-image-proxy
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，添加你的 GEMINI_API_KEY
```

4. **启动服务**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 🔑 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 登录你的 Google 账户
3. 创建新的 API 密钥
4. 复制密钥并添加到环境变量中

> **注意**: 即使在不支持的地区，也可以通过 VPN 获取 API 密钥

## 📖 使用指南

### 1. 上传参考图片
- 支持拖拽上传或点击选择
- 支持 JPG、PNG、GIF 格式
- 单个文件最大 10MB
- 可上传多张图片

### 2. 设置提示词
- 默认提供 3 个提示词输入框
- 可动态添加或删除提示词
- 每个提示词将基于上传的图片生成新图像

### 3. 配置生成参数
- 选择每个提示词生成的图片数量（1-5张）
- 系统会自动处理并显示进度

### 4. 查看和下载结果
- 生成的图片会显示在对应提示词下方
- 支持预览、下载功能
- 可选择继续生成更多图片

## 🏗️ 项目结构

```
gemini-image-proxy/
├── api/                    # API 路由
│   ├── generate.js        # 主要生成接口
│   └── download/          # 文件下载接口
│       └── [filename].js
├── public/                # 前端静态文件
│   ├── index.html        # 主页面
│   ├── styles.css        # 样式文件
│   └── script.js         # 前端逻辑
├── package.json          # 项目配置
├── vercel.json          # Vercel 部署配置
├── env.example          # 环境变量示例
└── README.md            # 项目文档
```

## 🔧 API 接口

### POST /api/generate

生成图像的主要接口

**请求参数**:
- `images`: 上传的图片文件（multipart/form-data）
- `prompts`: 提示词数组（JSON字符串）
- `count`: 每个提示词生成的图片数量

**响应格式**:
```json
{
  "success": true,
  "results": [
    {
      "prompt": "提示词内容",
      "results": [
        {
          "filename": "生成的文件名",
          "url": "/api/download/filename.jpg"
        }
      ]
    }
  ],
  "totalGenerated": 5
}
```

### GET /api/download/[filename]

下载生成的图片文件

## ⚡ 性能优化

- 使用内存存储上传文件，减少磁盘IO
- 实现速率限制，防止API滥用
- 支持流式响应，提升用户体验
- 自动清理临时文件

## 🛡️ 安全特性

- 文件类型验证（仅支持图片）
- 文件大小限制（10MB）
- 路径遍历攻击防护
- 速率限制保护
- CORS 跨域支持

## 🌐 部署选项

### Vercel（推荐）
- 免费额度充足
- 自动HTTPS
- 全球CDN
- 简单部署

### Railway
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

### Render
1. 连接 GitHub 仓库
2. 设置环境变量
3. 自动部署

### 自建服务器
```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "gemini-proxy" -- start
```

## 🔍 故障排除

### 常见问题

1. **API 密钥无效**
   - 检查 GEMINI_API_KEY 是否正确设置
   - 确认密钥在 Google AI Studio 中有效

2. **图片上传失败**
   - 检查文件格式是否支持
   - 确认文件大小不超过 10MB

3. **生成失败**
   - 检查网络连接
   - 确认 Gemini API 服务状态

4. **速率限制**
   - 等待限制时间结束
   - 考虑升级 API 配额

### 调试模式

设置环境变量启用详细日志：
```bash
NODE_ENV=development
```

## 📝 更新日志

### v1.0.0 (2024-12-19)
- 初始版本发布
- 支持 Gemini 图像生成
- 现代化 Web 界面
- 完整的文件管理系统

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Google Gemini](https://ai.google.dev/) - 提供强大的AI能力
- [Vercel](https://vercel.com/) - 优秀的部署平台
- [Apple Design](https://developer.apple.com/design/) - 设计灵感来源

## 📞 支持

如果你遇到问题或有建议，请：

1. 查看 [常见问题](#故障排除)
2. 搜索现有的 [Issues](https://github.com/your-username/gemini-image-proxy/issues)
3. 创建新的 Issue 描述你的问题

---

**⭐ 如果这个项目对你有帮助，请给它一个星标！** 