// Quick test script to check message API
// Run with: node test-message-api.js

const fetch = require('node-fetch');

const testMessageAPI = async () => {
  try {
    // Test messages API endpoint
    console.log('Testing message API...');
    const response = await fetch('http://localhost:3001/api/messages?tripId=test', {
      method: 'GET',
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testMessageAPI();
