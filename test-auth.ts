import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
const testUsername = `testuser_${Date.now()}`;
const testPassword = 'password123';

let authToken: string;

async function testRegister() {
  console.log('\n=== Testing POST /api/auth/register ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log('✓ Registration successful');
      console.log('User:', data.user);
      console.log('Token received:', data.token ? 'Yes' : 'No');
      authToken = data.token;
    } else {
      console.log('✗ Registration failed');
      console.log('Response:', data);
    }

    return response.status === 201;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== Testing POST /api/auth/login ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('✓ Login successful');
      console.log('User:', data.user);
      console.log('Token received:', data.token ? 'Yes' : 'No');
      authToken = data.token;
    } else {
      console.log('✗ Login failed');
      console.log('Response:', data);
    }

    return response.status === 200;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n=== Testing POST /api/auth/login (invalid credentials) ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: 'wrongpassword',
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log('✓ Invalid login correctly rejected');
      console.log('Error:', data.error);
    } else {
      console.log('✗ Expected 401 status');
      console.log('Response:', data);
    }

    return response.status === 401;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function testGetMe() {
  console.log('\n=== Testing GET /api/auth/me ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('✓ Get current user successful');
      console.log('User:', data.user);
    } else {
      console.log('✗ Get current user failed');
      console.log('Response:', data);
    }

    return response.status === 200;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function testGetMeWithoutToken() {
  console.log('\n=== Testing GET /api/auth/me (no token) ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log('✓ Unauthorized request correctly rejected');
      console.log('Error:', data.error);
    } else {
      console.log('✗ Expected 401 status');
      console.log('Response:', data);
    }

    return response.status === 401;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function testDuplicateRegistration() {
  console.log('\n=== Testing POST /api/auth/register (duplicate username) ===');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
      }),
    });

    const data = await response.json();

    if (response.status === 409) {
      console.log('✓ Duplicate registration correctly rejected');
      console.log('Error:', data.error);
    } else {
      console.log('✗ Expected 409 status');
      console.log('Response:', data);
    }

    return response.status === 409;
  } catch (error) {
    console.error('✗ Error:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting authentication API tests...');
  console.log(`Test username: ${testUsername}`);

  const results = {
    register: await testRegister(),
    login: await testLogin(),
    invalidLogin: await testInvalidLogin(),
    getMe: await testGetMe(),
    getMeWithoutToken: await testGetMeWithoutToken(),
    duplicateRegistration: await testDuplicateRegistration(),
  };

  console.log('\n=== Test Summary ===');
  console.log(`Register: ${results.register ? '✓' : '✗'}`);
  console.log(`Login: ${results.login ? '✓' : '✗'}`);
  console.log(`Invalid Login: ${results.invalidLogin ? '✓' : '✗'}`);
  console.log(`Get Me: ${results.getMe ? '✓' : '✗'}`);
  console.log(`Get Me Without Token: ${results.getMeWithoutToken ? '✓' : '✗'}`);
  console.log(`Duplicate Registration: ${results.duplicateRegistration ? '✓' : '✗'}`);

  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '✓ All tests passed!' : '✗ Some tests failed'}`);

  process.exit(allPassed ? 0 : 1);
}

runTests();
