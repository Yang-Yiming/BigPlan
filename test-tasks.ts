// 测试任务管理 API
// 运行方法: npx tsx test-tasks.ts

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
}

const results: TestResult[] = [];

let authToken = '';
let createdTaskId = 0;
let recurringTaskId = 0;

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ ${name}`);
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log('🧪 开始测试任务管理 API...\n');

  // 1. 注册用户并获取 token
  await test('注册用户', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        password: 'test123456',
      }),
    });

    if (!response.ok) {
      throw new Error(`注册失败: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.token;

    if (!authToken) {
      throw new Error('未获取到认证 token');
    }
  });

  // 2. 创建普通任务
  await test('创建普通任务', async () => {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: '完成项目文档',
        description: '撰写项目需求文档和技术方案',
        date: '2026-01-15',
        progressType: 'boolean',
      }),
    });

    if (!response.ok) {
      throw new Error(`创建任务失败: ${response.status}`);
    }

    const data = await response.json();
    createdTaskId = data.task.id;

    if (!createdTaskId) {
      throw new Error('未获取到任务 ID');
    }
  });

  // 3. 创建周期性任务
  await test('创建周期性任务', async () => {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: '每日站会',
        description: '参加团队每日站会',
        date: '2026-01-11',
        progressType: 'boolean',
        isRecurring: true,
        recurrencePattern: JSON.stringify({
          frequency: 'daily',
          interval: 1,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`创建周期性任务失败: ${response.status}`);
    }

    const data = await response.json();
    recurringTaskId = data.task.id;

    if (!recurringTaskId) {
      throw new Error('未获取到周期性任务 ID');
    }
  });

  // 4. 获取指定日期的任务列表
  await test('获取指定日期的任务列表', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks?date=2026-01-15`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`获取任务列表失败: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.tasks)) {
      throw new Error('返回的任务列表格式错误');
    }

    if (data.tasks.length === 0) {
      throw new Error('任务列表为空');
    }
  });

  // 5. 更新任务进度
  await test('更新任务进度', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks/${createdTaskId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          progressValue: 1,
          description: '已完成项目文档初稿',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`更新任务失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.task.progressValue !== 1) {
      throw new Error('任务进度未正确更新');
    }
  });

  // 6. 获取周期性任务列表
  await test('获取周期性任务列表', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks/recurring`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`获取周期性任务列表失败: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.tasks)) {
      throw new Error('返回的周期性任务列表格式错误');
    }

    if (data.tasks.length === 0) {
      throw new Error('周期性任务列表为空');
    }
  });

  // 7. 生成周期性任务
  await test('生成周期性任务', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks/generate-recurring`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          date: '2026-01-12',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`生成周期性任务失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.count === undefined) {
      throw new Error('未返回生成的任务数量');
    }
  });

  // 8. 验证生成的周期性任务
  await test('验证生成的周期性任务', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks?date=2026-01-12`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`获取任务列表失败: ${response.status}`);
    }

    const data = await response.json();
    const generatedTask = data.tasks.find(
      (t: any) => t.title === '每日站会' && !t.isRecurring
    );

    if (!generatedTask) {
      throw new Error('未找到生成的周期性任务实例');
    }
  });

  // 9. 删除任务
  await test('删除任务', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks/${createdTaskId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`删除任务失败: ${response.status}`);
    }
  });

  // 10. 验证任务已删除
  await test('验证任务已删除', async () => {
    const response = await fetch(
      `${BASE_URL}/api/tasks?date=2026-01-15`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`获取任务列表失败: ${response.status}`);
    }

    const data = await response.json();
    const deletedTask = data.tasks.find((t: any) => t.id === createdTaskId);

    if (deletedTask) {
      throw new Error('任务未被正确删除');
    }
  });

  // 打印测试结果摘要
  console.log('\n📊 测试结果摘要:');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`通过: ${passCount}/${results.length}`);
  console.log(`失败: ${failCount}/${results.length}`);

  if (failCount > 0) {
    console.log('\n❌ 失败的测试:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
