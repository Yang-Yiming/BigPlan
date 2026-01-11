import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logResult(name: string, success: boolean, error?: string) {
  results.push({ name, success, error });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function runTests() {
  console.log('🧪 Testing KISS Reflection API\n');

  let authToken = '';
  let testUserId = 0;
  const testDate = new Date().toISOString().split('T')[0];

  try {
    // 1. Register a test user
    console.log('1️⃣ Creating test user...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        username: `test_kiss_${Date.now()}`,
        password: 'password123',
      });
      authToken = registerResponse.data.token;
      testUserId = registerResponse.data.user.id;
      logResult('Register user', true);
    } catch (error: any) {
      logResult('Register user', false, error.response?.data?.error || error.message);
      return;
    }

    // 2. Create some tasks for testing unlock logic
    console.log('\n2️⃣ Creating test tasks...');
    try {
      await axios.post(
        `${API_BASE}/tasks`,
        {
          title: 'Test Task 1',
          description: 'First test task',
          date: testDate,
          progressType: 'boolean',
          progressValue: 0,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      await axios.post(
        `${API_BASE}/tasks`,
        {
          title: 'Test Task 2',
          description: 'Second test task',
          date: testDate,
          progressType: 'numeric',
          progressValue: 0,
          maxProgress: 5,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      logResult('Create tasks', true);
    } catch (error: any) {
      logResult('Create tasks', false, error.response?.data?.error || error.message);
    }

    // 3. Check unlock status (should be locked)
    console.log('\n3️⃣ Checking unlock status (should be locked)...');
    try {
      const unlockResponse = await axios.get(`${API_BASE}/kiss/check-unlock`, {
        params: { date: testDate },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { isUnlocked, totalTasks, completedTasks } = unlockResponse.data;
      const success = !isUnlocked && totalTasks === 2 && completedTasks === 0;
      logResult(
        'Check unlock status (locked)',
        success,
        success ? undefined : `Expected locked with 2 tasks, got isUnlocked=${isUnlocked}, tasks=${totalTasks}/${completedTasks}`
      );
    } catch (error: any) {
      logResult('Check unlock status (locked)', false, error.response?.data?.error || error.message);
    }

    // 4. Try to create KISS reflection while locked (should succeed but user should be warned)
    console.log('\n4️⃣ Creating KISS reflection...');
    try {
      const createResponse = await axios.post(
        `${API_BASE}/kiss`,
        {
          date: testDate,
          keep: 'Good things that happened today',
          improve: 'Things to improve',
          start: 'Things to start doing',
          stop: 'Things to stop doing',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      logResult('Create KISS reflection', true);
    } catch (error: any) {
      logResult('Create KISS reflection', false, error.response?.data?.error || error.message);
    }

    // 5. Get KISS reflection
    console.log('\n5️⃣ Getting KISS reflection...');
    try {
      const getResponse = await axios.get(`${API_BASE}/kiss`, {
        params: { date: testDate },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const reflection = getResponse.data.reflection;
      const success = reflection && reflection.keep === 'Good things that happened today';
      logResult('Get KISS reflection', success, success ? undefined : 'Reflection data mismatch');
    } catch (error: any) {
      logResult('Get KISS reflection', false, error.response?.data?.error || error.message);
    }

    // 6. Update KISS reflection
    console.log('\n6️⃣ Updating KISS reflection...');
    try {
      const updateResponse = await axios.post(
        `${API_BASE}/kiss`,
        {
          date: testDate,
          keep: 'Updated good things',
          improve: 'Updated improvements',
          start: 'Updated start',
          stop: 'Updated stop',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      logResult('Update KISS reflection', true);
    } catch (error: any) {
      logResult('Update KISS reflection', false, error.response?.data?.error || error.message);
    }

    // 7. Get tasks and complete them
    console.log('\n7️⃣ Completing all tasks...');
    try {
      const tasksResponse = await axios.get(`${API_BASE}/tasks`, {
        params: { date: testDate },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const tasks = tasksResponse.data.tasks;

      // Complete first task (boolean)
      await axios.put(
        `${API_BASE}/tasks/${tasks[0].id}`,
        { progressValue: 1 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Complete second task (numeric)
      await axios.put(
        `${API_BASE}/tasks/${tasks[1].id}`,
        { progressValue: 5 },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      logResult('Complete all tasks', true);
    } catch (error: any) {
      logResult('Complete all tasks', false, error.response?.data?.error || error.message);
    }

    // 8. Check unlock status again (should be unlocked)
    console.log('\n8️⃣ Checking unlock status (should be unlocked)...');
    try {
      const unlockResponse = await axios.get(`${API_BASE}/kiss/check-unlock`, {
        params: { date: testDate },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { isUnlocked, totalTasks, completedTasks } = unlockResponse.data;
      const success = isUnlocked && totalTasks === 2 && completedTasks === 2;
      logResult(
        'Check unlock status (unlocked)',
        success,
        success ? undefined : `Expected unlocked with 2/2 tasks, got isUnlocked=${isUnlocked}, tasks=${totalTasks}/${completedTasks}`
      );
    } catch (error: any) {
      logResult('Check unlock status (unlocked)', false, error.response?.data?.error || error.message);
    }

    // 9. Test past date unlock (should be automatically unlocked)
    console.log('\n9️⃣ Testing past date unlock...');
    try {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const unlockResponse = await axios.get(`${API_BASE}/kiss/check-unlock`, {
        params: { date: pastDateStr },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const { canRetroactivelyFill } = unlockResponse.data;
      logResult(
        'Past date unlock',
        canRetroactivelyFill,
        canRetroactivelyFill ? undefined : 'Past dates should allow retroactive filling'
      );
    } catch (error: any) {
      logResult('Past date unlock', false, error.response?.data?.error || error.message);
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. See details above.');
  }
}

runTests();
