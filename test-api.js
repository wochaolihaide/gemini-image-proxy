const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 简单的API测试脚本
async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API connection...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('Please create a .env file with your API key:');
    console.log('GEMINI_API_KEY=your_api_key_here');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    console.log('🔑 API Key found, testing connection...');
    
    const result = await model.generateContent("Hello, can you respond with a simple greeting?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API connection successful!');
    console.log('📝 Response:', text);
    console.log('\n🎉 Your Gemini API is working correctly!');
    console.log('You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check if your API key is correct');
      console.log('2. Make sure the API key is active in Google AI Studio');
      console.log('3. Verify you have access to Gemini API');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Your API key might not have access to this model');
      console.log('2. Check your Google AI Studio permissions');
      console.log('3. Try using a VPN if you\'re in an unsupported region');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the API key is correctly set');
      console.log('3. Try again in a few minutes');
    }
  }
}

// 运行测试
if (require.main === module) {
  testGeminiAPI();
}

module.exports = testGeminiAPI; 