const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ SUCCESS');
          try {
            const parsed = JSON.parse(body);
            console.log('Response:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Response:', body);
          }
        } else {
          console.log('❌ FAILED');
          console.log('Response:', body);
        }
        console.log('---');
        resolve({ status: res.statusCode, body: body });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ERROR ${method} ${path}: ${err.message}`);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Backend API Endpoints...\n');

  try {
    // Test root endpoint
    await testEndpoint('/');
    
    // Test colleges endpoint
    await testEndpoint('/api/colleges');
    
    // Test students endpoint  
    await testEndpoint('/api/students');
    
    // Test reports endpoint
    await testEndpoint('/api/reports/overall-stats');
    
    // Test events endpoint (might fail due to auth)
    await testEndpoint('/api/events');
    
    console.log('\n🏁 Testing completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
