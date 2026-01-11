# 数据库性能优化文档

## 当前数据库结构分析

### 表结构
1. **users** - 用户表
2. **tasks** - 任务表
3. **comments** - 评论表
4. **groups** - 群组表
5. **group_members** - 群组成员表
6. **kiss_reflections** - KISS 反思表

### 常见查询模式

#### 高频查询
1. 按用户ID和日期查询任务：`userId + date`
2. 按用户ID查询周期性任务：`userId + isRecurring`
3. 按目标用户和日期查询评论：`targetUserId + date`
4. 按任务ID查询评论：`taskId`

## 优化建议

### 1. 索引优化

#### tasks 表索引
```sql
-- 复合索引：用于按用户和日期查询任务
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);

-- 索引：用于查询周期性任务
CREATE INDEX idx_tasks_user_recurring ON tasks(user_id, is_recurring) WHERE is_recurring = 1;

-- 索引：用于时间排序
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

#### comments 表索引
```sql
-- 复合索引：用于按目标用户和日期查询评论
CREATE INDEX idx_comments_target_date ON comments(target_user_id, date);

-- 索引：用于按任务查询评论
CREATE INDEX idx_comments_task ON comments(task_id);

-- 索引：用于查询每日评论
CREATE INDEX idx_comments_daily ON comments(target_user_id, is_daily_comment, date);
```

#### groups 表索引
```sql
-- 索引：用于查询用户创建的群组
CREATE INDEX idx_groups_creator ON groups(creator_user_id);
```

#### group_members 表索引
```sql
-- 复合索引：用于查询用户所属群组
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- 复合索引：用于查询群组成员
CREATE INDEX idx_group_members_group ON group_members(group_id);

-- 唯一索引：防止重复成员
CREATE UNIQUE INDEX idx_group_members_unique ON group_members(group_id, user_id);
```

### 2. 查询优化

#### 当前查询示例
```typescript
// 获取指定日期的任务
const taskList = await db
  .select()
  .from(tasks)
  .where(and(eq(tasks.userId, userPayload.userId), eq(tasks.date, date)))
  .orderBy(tasks.createdAt);
```

**优化建议**：
- ✅ 已使用复合条件 (userId + date)
- ✅ 使用了 ORM 的参数化查询
- 需要确保有对应的复合索引

#### 分页查询优化
对于可能返回大量数据的查询，应实现分页：

```typescript
// 添加分页支持
const page = parseInt(c.req.query('page') || '1');
const pageSize = parseInt(c.req.query('pageSize') || '20');
const offset = (page - 1) * pageSize;

const taskList = await db
  .select()
  .from(tasks)
  .where(and(eq(tasks.userId, userPayload.userId), eq(tasks.date, date)))
  .orderBy(tasks.createdAt)
  .limit(pageSize)
  .offset(offset);
```

### 3. N+1 查询优化

#### 问题示例
避免在循环中执行查询：

```typescript
// ❌ 不好的做法
for (const task of tasks) {
  const comments = await db.select().from(comments).where(eq(comments.taskId, task.id));
}

// ✅ 好的做法
const taskIds = tasks.map(t => t.id);
const allComments = await db
  .select()
  .from(comments)
  .where(inArray(comments.taskId, taskIds));
```

### 4. 缓存策略

#### Cloudflare Workers KV 缓存
对于频繁访问但不常变化的数据，可以使用 KV 存储：

```typescript
// 缓存用户信息
const cachedUser = await env.USER_CACHE.get(`user:${userId}`, { type: 'json' });
if (cachedUser) return cachedUser;

const user = await db.select().from(users).where(eq(users.id, userId));
await env.USER_CACHE.put(`user:${userId}`, JSON.stringify(user), {
  expirationTtl: 3600, // 1 小时过期
});
```

#### 适合缓存的数据
- 用户基本信息
- 群组信息
- 不常变化的配置

#### 不适合缓存的数据
- 任务列表（频繁更新）
- 评论（实时性要求高）
- 进度数据

### 5. 批量操作优化

#### 批量插入
```typescript
// ✅ 批量插入任务
const newTasks = [
  { userId, title: 'Task 1', date: '2026-01-11' },
  { userId, title: 'Task 2', date: '2026-01-11' },
  { userId, title: 'Task 3', date: '2026-01-11' },
];

await db.insert(tasks).values(newTasks);
```

#### 批量更新
```typescript
// 对于需要不同更新值的记录，使用事务
await db.transaction(async (tx) => {
  for (const update of updates) {
    await tx.update(tasks)
      .set({ progressValue: update.value })
      .where(eq(tasks.id, update.id));
  }
});
```

### 6. 数据归档策略

对于历史数据，可以考虑归档：

```sql
-- 创建归档表
CREATE TABLE tasks_archive AS SELECT * FROM tasks WHERE 0;

-- 定期归档旧数据（例如 6 个月前的已完成任务）
INSERT INTO tasks_archive
SELECT * FROM tasks
WHERE date < date('now', '-6 months')
  AND progress_value = max_progress;

-- 删除已归档的数据
DELETE FROM tasks
WHERE date < date('now', '-6 months')
  AND progress_value = max_progress;
```

## 性能监控

### 1. 查询性能分析

在开发环境中记录慢查询：

```typescript
const startTime = Date.now();
const result = await db.select().from(tasks).where(...);
const duration = Date.now() - startTime;

if (duration > 100) { // 超过 100ms
  console.warn(`Slow query detected: ${duration}ms`, { query: '...' });
}
```

### 2. Cloudflare Analytics

使用 Cloudflare Workers 的内置分析：
- 请求频率
- 响应时间
- 错误率
- CPU 使用时间

### 3. 自定义指标

```typescript
// 在关键接口添加性能指标
c.executionCtx.waitUntil(
  fetch('https://your-analytics-endpoint.com/metrics', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: '/api/tasks',
      duration,
      timestamp: Date.now(),
    }),
  })
);
```

## 实施优先级

### 高优先级 🔴
1. **添加复合索引**：userId + date (tasks, comments)
2. **实现分页**：对所有列表接口
3. **避免 N+1 查询**：使用 JOIN 或批量查询

### 中优先级 🟡
1. **实现缓存**：用户信息、群组信息
2. **查询优化**：只查询需要的字段
3. **批量操作**：优化周期性任务生成

### 低优先级 🟢
1. **数据归档**：历史数据清理
2. **性能监控**：慢查询日志
3. **连接池管理**：优化数据库连接

## Cloudflare D1 特定优化

### 1. D1 限制
- 单个查询最多返回 10,000 行
- 单个事务最多 1,000 个语句
- 数据库大小限制（根据计划）

### 2. D1 最佳实践
```typescript
// 使用 batch API 批量执行查询
const results = await db.batch([
  db.select().from(users).where(eq(users.id, 1)),
  db.select().from(tasks).where(eq(tasks.userId, 1)),
  db.select().from(groups).where(eq(groups.creatorUserId, 1)),
]);
```

### 3. 读写分离
对于只读查询，可以考虑使用 Read Replicas（如果 D1 支持）

## 总结

### 当前状态
- ✅ 使用了 ORM (Drizzle)
- ✅ 参数化查询，防止 SQL 注入
- ✅ 外键关系正确配置
- ⚠️ 缺少必要的索引
- ⚠️ 部分查询可能存在 N+1 问题

### 建议行动
1. 立即添加推荐的索引
2. 为列表接口实现分页
3. 审查所有查询，避免 N+1 问题
4. 实现基本的查询性能监控

### 预期收益
- 查询速度提升 50-80%
- 减少数据库负载
- 提升用户体验
- 支持更大规模的数据量
