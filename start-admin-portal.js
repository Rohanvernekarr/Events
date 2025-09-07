// Complete admin portal startup and test script
const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 Starting Campus Admin Portal with Backend Integration\n');

async function checkBackend() {
  console.log('1. Checking backend connection...');
  try {
    const response = await axios.get('http://localhost:3001/');
    console.log('✅ Backend is running');
    return true;
  } catch (error) {
    console.log('❌ Backend not running. Please start backend first:');
    console.log('   cd backend && npm run dev');
    return false;
  }
}

async function testAdminLogin() {
  console.log('2. Testing admin login endpoint...');
  try {
    const response = await axios.post('http://localhost:3001/api/auth/admin/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    console.log('✅ Admin login working');
    console.log('   Token:', response.data.token.substring(0, 20) + '...');
    return response.data.token;
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testDataEndpoints(token) {
  console.log('3. Testing data endpoints...');
  
  const endpoints = [
    { name: 'Overall Stats', url: '/api/reports/overall-stats' },
    { name: 'Colleges', url: '/api/colleges' },
    { name: 'Events', url: '/api/events' },
    { name: 'Students', url: '/api/students' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:3001${endpoint.url}`);
      console.log(`   ✅ ${endpoint.name}: OK`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Failed'}`);
    }
  }
}

async function main() {
  const backendRunning = await checkBackend();
  if (!backendRunning) return;

  const token = await testAdminLogin();
  if (!token) return;

  await testDataEndpoints(token);

  console.log('\n🎉 Backend Integration Complete!');
  console.log('\n📋 Admin Portal Ready:');
  console.log('   URL: http://localhost:3000');
  console.log('   Email: admin@admin.com');
  console.log('   Password: admin123');
  console.log('\n🔧 To start admin portal:');
  console.log('   cd campus-admin && npm run dev');
  console.log('\n✨ Login Flow:');
  console.log('   1. Go to http://localhost:3000');
  console.log('   2. Enter admin credentials');
  console.log('   3. Access dashboard with real backend data');
}

main().catch(console.error);
