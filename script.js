// 全局变量
let uploadedFiles = [];
let isGenerating = false;
let rateLimitTimer = null;

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedImages = document.getElementById('uploadedImages');
const promptsContainer = document.getElementById('promptsContainer');
const addPromptBtn = document.getElementById('addPromptBtn');
const generateBtn = document.getElementById('generateBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressStatus = document.getElementById('progressStatus');
const timeRemaining = document.getElementById('timeRemaining');
const rateLimitInfo = document.getElementById('rateLimitInfo');
const rateLimitTimerElement = document.getElementById('rateLimitTimer');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updatePromptNumbers();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 文件上传相关
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // 提示词相关
    addPromptBtn.addEventListener('click', addPromptItem);

    // 生成按钮
    generateBtn.addEventListener('click', handleGenerate);
}

// 文件拖拽处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// 添加文件
function addFiles(files) {
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`文件 ${file.name} 超过 10MB 限制`);
            return;
        }
        
        if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
            uploadedFiles.push(file);
            displayUploadedImage(file);
        }
    });
}

// 显示上传的图片
function displayUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'uploaded-image';
        imageDiv.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <button class="remove-image" onclick="removeImage('${file.name}', ${file.size})">×</button>
        `;
        uploadedImages.appendChild(imageDiv);
    };
    reader.readAsDataURL(file);
}

// 移除图片
function removeImage(fileName, fileSize) {
    uploadedFiles = uploadedFiles.filter(f => !(f.name === fileName && f.size === fileSize));
    
    // 重新渲染上传的图片
    uploadedImages.innerHTML = '';
    uploadedFiles.forEach(file => displayUploadedImage(file));
}

// 添加提示词项
function addPromptItem() {
    const promptItem = document.createElement('div');
    promptItem.className = 'prompt-item';
    promptItem.innerHTML = `
        <div class="prompt-header">
            <span class="prompt-number"></span>
            <button class="btn-remove" onclick="removePrompt(this)">×</button>
        </div>
        <textarea class="prompt-input" placeholder="请输入图像生成提示词..."></textarea>
        <div class="prompt-results" style="display: none;"></div>
    `;
    promptsContainer.appendChild(promptItem);
    updatePromptNumbers();
}

// 移除提示词项
function removePrompt(button) {
    const promptItem = button.closest('.prompt-item');
    if (promptsContainer.children.length > 1) {
        promptItem.remove();
        updatePromptNumbers();
    } else {
        alert('至少需要保留一个提示词');
    }
}

// 更新提示词编号
function updatePromptNumbers() {
    const promptItems = promptsContainer.querySelectorAll('.prompt-item');
    promptItems.forEach((item, index) => {
        const numberSpan = item.querySelector('.prompt-number');
        numberSpan.textContent = index + 1;
    });
}

// 处理生成请求
async function handleGenerate() {
    if (isGenerating) return;

    // 验证输入
    if (uploadedFiles.length === 0) {
        alert('请至少上传一张图片');
        return;
    }

    const prompts = getPrompts();
    if (prompts.length === 0) {
        alert('请至少输入一个提示词');
        return;
    }

    const imageCount = parseInt(document.getElementById('imageCount').value);

    try {
        isGenerating = true;
        updateGenerateButton(true);
        showProgress();

        // 准备FormData
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            formData.append('images', file);
        });
        formData.append('prompts', JSON.stringify(prompts));
        formData.append('count', imageCount);

        // 发送请求
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 429) {
                showRateLimit(errorData.retryAfter);
            }
            throw new Error(errorData.error || '生成失败');
        }

        const result = await response.json();
        displayResults(result.results);
        
    } catch (error) {
        console.error('Generation error:', error);
        alert(`生成失败: ${error.message}`);
    } finally {
        isGenerating = false;
        updateGenerateButton(false);
        hideProgress();
    }
}

// 获取所有提示词
function getPrompts() {
    const promptInputs = promptsContainer.querySelectorAll('.prompt-input');
    return Array.from(promptInputs)
        .map(input => input.value.trim())
        .filter(prompt => prompt.length > 0);
}

// 更新生成按钮状态
function updateGenerateButton(loading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        generateBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// 显示进度
function showProgress() {
    progressSection.style.display = 'block';
    
    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) progress = 90;
        
        updateProgress(progress, '生成中...', '预计剩余时间: 计算中...');
        
        if (!isGenerating) {
            clearInterval(interval);
            updateProgress(100, '完成', '');
        }
    }, 1000);
}

// 隐藏进度
function hideProgress() {
    setTimeout(() => {
        progressSection.style.display = 'none';
        updateProgress(0, '准备中...', '');
    }, 2000);
}

// 更新进度
function updateProgress(percent, status, remaining) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
    progressStatus.textContent = status;
    timeRemaining.textContent = remaining;
}

// 显示速率限制
function showRateLimit(retryAfter) {
    rateLimitInfo.style.display = 'block';
    
    let remaining = retryAfter;
    rateLimitTimerElement.textContent = `${remaining}秒`;
    
    rateLimitTimer = setInterval(() => {
        remaining--;
        rateLimitTimerElement.textContent = `${remaining}秒`;
        
        if (remaining <= 0) {
            clearInterval(rateLimitTimer);
            rateLimitInfo.style.display = 'none';
        }
    }, 1000);
}

// 显示生成结果
function displayResults(results) {
    results.forEach((result, index) => {
        const promptItems = promptsContainer.querySelectorAll('.prompt-item');
        const promptItem = promptItems[index];
        
        if (promptItem) {
            const resultsDiv = promptItem.querySelector('.prompt-results');
            resultsDiv.style.display = 'block';
            
            // 清空之前的结果
            resultsDiv.innerHTML = '<h4>生成结果:</h4>';
            
            if (result.results && result.results.length > 0) {
                const resultGrid = document.createElement('div');
                resultGrid.className = 'result-grid';
                
                result.results.forEach((item, itemIndex) => {
                    if (item.filename) {
                        const resultItem = createResultItem(item, result.prompt, itemIndex);
                        resultGrid.appendChild(resultItem);
                    }
                });
                
                resultsDiv.appendChild(resultGrid);
                
                // 添加继续生成按钮
                const continueBtn = document.createElement('button');
                continueBtn.className = 'btn-secondary';
                continueBtn.textContent = '继续生成';
                continueBtn.style.marginTop = '16px';
                continueBtn.onclick = () => continueGeneration(index);
                resultsDiv.appendChild(continueBtn);
            } else {
                resultsDiv.innerHTML += '<p>未生成任何图片</p>';
            }
        }
    });
}

// 创建结果项
function createResultItem(item, prompt, index) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    // 创建图片URL（使用相对路径）
    const imageUrl = item.url;
    
    resultItem.innerHTML = `
        <img src="${imageUrl}" alt="Generated image ${index + 1}" loading="lazy">
        <div class="result-actions">
            <button class="result-btn" onclick="viewImage('${imageUrl}')">查看</button>
            <button class="result-btn" onclick="downloadImage('${imageUrl}', '${item.filename}')">下载</button>
        </div>
    `;
    
    return resultItem;
}

// 查看图片
function viewImage(url) {
    window.open(url, '_blank');
}

// 下载图片
function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 继续生成
function continueGeneration(promptIndex) {
    // 获取对应的提示词
    const promptItems = promptsContainer.querySelectorAll('.prompt-item');
    const promptInput = promptItems[promptIndex].querySelector('.prompt-input');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert('提示词不能为空');
        return;
    }
    
    // 模拟继续生成（实际应该调用API）
    handleGenerate();
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
}); 