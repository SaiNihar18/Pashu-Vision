// Quick test to verify API key is working
console.log('Testing Gemini API key...');
console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10));

// Test if it's being passed correctly by vite
console.log('Environment check:', {
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  API_KEY: !!process.env.API_KEY,
  length: process.env.GEMINI_API_KEY?.length
});