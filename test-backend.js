const http = require('http');

// Test registration
function testRegister() {
  const data = JSON.stringify({
    name: 'Backend Test User',
    email: 'backendtest@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Register Status:', res.statusCode);
        console.log('Register Response:', body.substring(0, 200) + '...');
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test login
function testLogin() {
  const data = JSON.stringify({
    email: 'backendtest@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Login Status:', res.statusCode);
        console.log('Login Response:', body.substring(0, 200) + '...');

        // Extract cookie for next request
        const cookies = res.headers['set-cookie'];
        resolve({ status: res.statusCode, body, cookies });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test protected route
function testDashboard(cookies) {
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/gigs/user/me',
    method: 'GET',
    headers: {
      'Cookie': cookies ? cookies[0] : ''
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Dashboard Status:', res.statusCode);
        console.log('Dashboard Response:', body.substring(0, 200) + '...');
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    console.log('=== TESTING BACKEND APIs ===');

    console.log('\n1. Testing Registration...');
    await testRegister();

    console.log('\n2. Testing Login...');
    const loginResult = await testLogin();

    if (loginResult.cookies) {
      console.log('\n3. Testing Protected Route...');
      await testDashboard(loginResult.cookies);
    }

    console.log('\n=== TESTS COMPLETED ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();