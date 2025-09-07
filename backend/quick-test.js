const http = require('http');

// Simple test without external dependencies
function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@admin.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Admin login working!');
      } else {
        console.log('❌ Login failed');
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    console.log('Make sure backend is running: npm run dev');
  });

  req.write(postData);
  req.end();
}

console.log('🔍 Testing admin login...');
testLogin();
