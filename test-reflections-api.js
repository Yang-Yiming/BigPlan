#!/usr/bin/env node

/**
 * KISS 复盘 API 测试脚本
 *
 * 测试所有复盘相关的 API 接口
 */

const API_BASE = 'http://localhost:3000/api';

// 测试用户凭证
const TEST_USER = {
  username: 'kiss_test_user',
  password: 'test123456',
};

let authToken = '';
let userId = 0;

// 工具函数：发送 HTTP 请求
async function request(method, path, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

// 测试函数
async function testRegister() {
  console.log('\n=== 测试用户注册 ===');
  const result = await request('POST', '/auth/register', TEST_USER);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');

  if (result.ok) {
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log(`用户 ID: ${userId}`);
    console.log('Token 已获取');
  } else {
    // 如果用户已存在，尝试登录
    console.log('用户已存在，尝试登录...');
    await testLogin();
  }
}

async function testLogin() {
  console.log('\n=== 测试用户登录 ===');
  const result = await request('POST', '/auth/login', TEST_USER);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');

  if (result.ok) {
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log(`用户 ID: ${userId}`);
    console.log('Token 已获取');
  } else {
    throw new Error('登录失败');
  }
}

async function testCreateTask() {
  console.log('\n=== 测试创建任务 ===');
  const today = new Date().toISOString().split('T')[0];

  const task1 = {
    title: '完成 KISS 复盘 API',
    description: '实现所有复盘相关接口',
    date: today,
    progressType: 'boolean',
    progressValue: 0,
  };

  const result = await request('POST', '/tasks', task1, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok) {
    console.log(`任务已创建: ${result.data.task.title}`);
    return result.data.task.id;
  }
  return null;
}

async function testCompleteTask(taskId) {
  console.log('\n=== 测试完成任务 ===');
  const result = await request(
    'PUT',
    `/tasks/${taskId}`,
    { progressValue: 1 },
    authToken
  );
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok) {
    console.log(`任务已完成: ${result.data.task.title}`);
  }
}

async function testGetReflectionLocked() {
  console.log('\n=== 测试获取锁定的复盘（当天任务未完成）===');
  const today = new Date().toISOString().split('T')[0];
  const result = await request('GET', `/reflections?date=${today}`, null, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  console.log(`解锁状态: ${result.data.unlocked}`, !result.data.unlocked ? '✓' : '✗');
  if (result.data.unlockReason) {
    console.log(`原因: ${result.data.unlockReason}`);
  }
}

async function testCreateReflectionWhenLocked() {
  console.log('\n=== 测试创建锁定的复盘（应该失败）===');
  const today = new Date().toISOString().split('T')[0];
  const reflection = {
    date: today,
    keep: '保持专注',
    improve: '提高效率',
    start: '早起',
    stop: '拖延',
  };

  const result = await request('POST', '/reflections', reflection, authToken);
  console.log(`状态: ${result.status}`, !result.ok ? '✓' : '✗');
  if (!result.ok) {
    console.log(`错误信息: ${result.data.error}`);
    console.log(`原因: ${result.data.reason}`);
  }
}

async function testCreateReflectionAfterTaskComplete() {
  console.log('\n=== 测试任务完成后创建复盘 ===');
  const today = new Date().toISOString().split('T')[0];
  const reflection = {
    date: today,
    keep: 'API 设计清晰',
    improve: '添加更多测试',
    start: '写文档',
    stop: '过度优化',
  };

  const result = await request('POST', '/reflections', reflection, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok) {
    console.log('复盘已创建');
    console.log(`Keep: ${result.data.reflection.keep}`);
    console.log(`Improve: ${result.data.reflection.improve}`);
  }
}

async function testUpdateReflection() {
  console.log('\n=== 测试更新复盘 ===');
  const today = new Date().toISOString().split('T')[0];
  const reflection = {
    date: today,
    keep: 'API 设计清晰，测试完善',
    improve: '添加更多边界情况测试',
    start: '写详细文档',
    stop: '过度优化，拖延',
  };

  const result = await request('POST', '/reflections', reflection, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok) {
    console.log('复盘已更新');
    console.log(`Keep: ${result.data.reflection.keep}`);
  }
}

async function testGetReflection() {
  console.log('\n=== 测试获取复盘 ===');
  const today = new Date().toISOString().split('T')[0];
  const result = await request('GET', `/reflections?date=${today}`, null, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok && result.data.reflection) {
    console.log('复盘内容:');
    console.log(`  Keep: ${result.data.reflection.keep}`);
    console.log(`  Improve: ${result.data.reflection.improve}`);
    console.log(`  Start: ${result.data.reflection.start}`);
    console.log(`  Stop: ${result.data.reflection.stop}`);
    console.log(`解锁状态: ${result.data.unlocked}`);
  }
}

async function testGetUserReflection() {
  console.log('\n=== 测试获取其他用户的复盘 ===');
  const today = new Date().toISOString().split('T')[0];
  const result = await request(
    'GET',
    `/reflections/user/${userId}?date=${today}`,
    null,
    authToken
  );
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok && result.data.reflection) {
    console.log('找到其他用户的复盘');
    console.log(`Keep: ${result.data.reflection.keep}`);
  }
}

async function testHistoricalReflection() {
  console.log('\n=== 测试历史日期复盘（总是解锁）===');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().split('T')[0];

  const reflection = {
    date,
    keep: '昨天工作效率很高',
    improve: '可以更早开始',
    start: '晨间锻炼',
    stop: '熬夜',
  };

  const result = await request('POST', '/reflections', reflection, authToken);
  console.log(`状态: ${result.status}`, result.ok ? '✓' : '✗');
  if (result.ok) {
    console.log('历史复盘已创建');
  }
}

async function testFutureReflection() {
  console.log('\n=== 测试未来日期复盘（应该失败）===');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().split('T')[0];

  const reflection = {
    date,
    keep: '未来复盘',
    improve: '测试',
    start: '测试',
    stop: '测试',
  };

  const result = await request('POST', '/reflections', reflection, authToken);
  console.log(`状态: ${result.status}`, !result.ok ? '✓' : '✗');
  if (!result.ok) {
    console.log(`错误信息: ${result.data.error}`);
  }
}

async function testInvalidDateFormat() {
  console.log('\n=== 测试无效日期格式 ===');
  const result = await request('GET', '/reflections?date=2024-1-1', null, authToken);
  console.log(`状态: ${result.status}`, !result.ok ? '✓' : '✗');
  if (!result.ok) {
    console.log(`错误信息: ${result.data.error}`);
  }
}

async function testUnauthorized() {
  console.log('\n=== 测试未授权访问 ===');
  const today = new Date().toISOString().split('T')[0];
  const result = await request('GET', `/reflections?date=${today}`, null, null);
  console.log(`状态: ${result.status}`, !result.ok ? '✓' : '✗');
  if (!result.ok) {
    console.log(`错误信息: ${result.data.error}`);
  }
}

// 主测试流程
async function runTests() {
  console.log('开始 KISS 复盘 API 测试...');
  console.log(`API 地址: ${API_BASE}`);

  try {
    // 1. 认证
    await testRegister();

    // 2. 测试未授权访问
    await testUnauthorized();

    // 3. 测试无效日期格式
    await testInvalidDateFormat();

    // 4. 创建任务（未完成）
    const taskId = await testCreateTask();

    // 5. 测试锁定状态下的复盘
    await testGetReflectionLocked();
    await testCreateReflectionWhenLocked();

    // 6. 完成任务
    if (taskId) {
      await testCompleteTask(taskId);
    }

    // 7. 任务完成后创建复盘
    await testCreateReflectionAfterTaskComplete();

    // 8. 更新复盘
    await testUpdateReflection();

    // 9. 获取复盘
    await testGetReflection();

    // 10. 获取其他用户的复盘
    await testGetUserReflection();

    // 11. 测试历史日期复盘
    await testHistoricalReflection();

    // 12. 测试未来日期复盘
    await testFutureReflection();

    console.log('\n========================================');
    console.log('所有测试完成！');
    console.log('========================================');

  } catch (error) {
    console.error('\n测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runTests();
