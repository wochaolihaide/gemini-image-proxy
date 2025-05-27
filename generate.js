const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// 速率限制器：每分钟最多10次请求
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

// 配置multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// 初始化Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 确保输出目录存在
const ensureOutputDir = async () => {
  const outputDir = path.join('/tmp', 'generated_images');
  await fs.ensureDir(outputDir);
  return outputDir;
};

// 将buffer转换为Gemini可用的格式
const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType,
    },
  };
};

// 保存生成的图片
const saveGeneratedImage = async (imageData, mimeType, prompt, index) => {
  const outputDir = await ensureOutputDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = mimeType.split('/')[1];
  const filename = `${prompt.substring(0, 10)}_${timestamp}_${index}.${extension}`;
  const filepath = path.join(outputDir, filename);
  
  const buffer = Buffer.from(imageData, 'base64');
  await fs.writeFile(filepath, buffer);
  
  return {
    filename,
    filepath,
    url: `/api/download/${filename}`
  };
};

module.exports = async (req, res) => {
  // 启用CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 检查速率限制
    await rateLimiter.consume(req.ip);
  } catch (rejRes) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) 
    });
  }

  // 使用multer处理文件上传
  upload.array('images', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { prompts, count = 1 } = req.body;
      const files = req.files;

      if (!prompts || !Array.isArray(JSON.parse(prompts))) {
        return res.status(400).json({ error: 'Prompts array is required' });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      const promptsArray = JSON.parse(prompts);
      const imageCount = parseInt(count);

      if (imageCount > 5) {
        return res.status(400).json({ error: 'Maximum 5 images per request' });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
      const results = [];

      // 处理每个提示词
      for (let promptIndex = 0; promptIndex < promptsArray.length; promptIndex++) {
        const prompt = promptsArray[promptIndex];
        const promptResults = [];

        // 为每个提示词生成指定数量的图片
        for (let i = 0; i < imageCount; i++) {
          try {
            // 准备图片部分
            const imageParts = files.map(file => 
              bufferToGenerativePart(file.buffer, file.mimetype)
            );

            // 构建完整的提示词，包含图像生成指令
            const fullPrompt = `Based on the uploaded image(s), ${prompt}. Please generate a new image that incorporates these elements and follows the description.`;

            // 构建内容
            const parts = [
              ...imageParts,
              { text: fullPrompt }
            ];

            // 生成内容
            const result = await model.generateContent(parts);
            const response = await result.response;
            
            // 检查响应
            if (response.candidates && response.candidates[0]) {
              const candidate = response.candidates[0];
              
              // 检查是否有图片数据
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData) {
                    const savedImage = await saveGeneratedImage(
                      part.inlineData.data,
                      part.inlineData.mimeType,
                      prompt,
                      i
                    );
                    promptResults.push(savedImage);
                  }
                }
              }

              // 添加文本响应（如果有）
              try {
                const text = response.text();
                if (text && text.trim()) {
                  promptResults.push({ text: text.trim() });
                }
              } catch (textError) {
                // 忽略文本提取错误
                console.log('No text response available');
              }
            }

            // 如果没有生成任何内容，添加错误信息
            if (promptResults.length === 0) {
              promptResults.push({ 
                error: 'No content generated. The model may not support image generation with this input.' 
              });
            }

          } catch (error) {
            console.error(`Error generating image ${i} for prompt ${promptIndex}:`, error);
            promptResults.push({ error: error.message });
          }
        }

        results.push({
          prompt,
          results: promptResults
        });
      }

      res.json({
        success: true,
        results,
        totalGenerated: results.reduce((sum, r) => sum + r.results.length, 0)
      });

    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}; 