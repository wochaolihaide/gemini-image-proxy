const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

module.exports = async (req, res) => {
  // 启用CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const outputDir = path.join('/tmp', 'generated_images');
    const filepath = path.join(outputDir, filename);

    // 检查文件是否存在
    if (!(await fs.pathExists(filepath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filepath);
    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    // 设置响应头
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // 发送文件
    res.send(fileBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
}; 