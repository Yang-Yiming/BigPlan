# 任务管理模块 API 文档

## 概述

任务管理模块提供完整的任务 CRUD 功能，支持周期性任务的创建和自动生成。

## 认证

所有任务相关接口都需要 JWT 认证。在请求头中添加：

```
Authorization: Bearer <your-jwt-token>
```

## API 端点

### 1. 创建任务

**POST** `/api/tasks`

创建一个新任务，支持普通任务和周期性任务。

**请求体：**

```json
{
  "title": "任务标题（必填）",
  "description": "任务描述（可选）",
  "date": "2026-01-15（必填，YYYY-MM-DD 格式）",
  "progressType": "boolean | numeric | percentage（可选，默认 boolean）",
  "progressValue": 0,
  "maxProgress": 100,
  "isRecurring": false,
  "recurrencePattern": "{\"frequency\": \"daily\", \"interval\": 1}"
}
```

**响应：**

```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "userId": 1,
    "title": "任务标题",
    "description": "任务描述",
    "date": "2026-01-15",
    "progressType": "boolean",
    "progressValue": 0,
    "maxProgress": null,
    "isRecurring": false,
    "recurrencePattern": null,
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:00:00.000Z"
  }
}
```

### 2. 获取指定日期的任务列表

**GET** `/api/tasks?date=YYYY-MM-DD`

获取指定日期的所有任务。

**查询参数：**

- `date` (必填): 日期，格式为 YYYY-MM-DD

**响应：**

```json
{
  "tasks": [
    {
      "id": 1,
      "userId": 1,
      "title": "任务标题",
      "description": "任务描述",
      "date": "2026-01-15",
      "progressType": "boolean",
      "progressValue": 0,
      "maxProgress": null,
      "isRecurring": false,
      "recurrencePattern": null,
      "createdAt": "2026-01-11T10:00:00.000Z",
      "updatedAt": "2026-01-11T10:00:00.000Z"
    }
  ]
}
```

### 3. 更新任务

**PUT** `/api/tasks/:id`

更新指定任务的信息，包括进度。

**路径参数：**

- `id`: 任务 ID

**请求体（所有字段都是可选的）：**

```json
{
  "title": "更新的标题",
  "description": "更新的描述",
  "date": "2026-01-16",
  "progressType": "numeric",
  "progressValue": 5,
  "maxProgress": 10,
  "isRecurring": false,
  "recurrencePattern": null
}
```

**响应：**

```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 1,
    "userId": 1,
    "title": "更新的标题",
    "description": "更新的描述",
    "date": "2026-01-16",
    "progressType": "numeric",
    "progressValue": 5,
    "maxProgress": 10,
    "isRecurring": false,
    "recurrencePattern": null,
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:05:00.000Z"
  }
}
```

### 4. 删除任务

**DELETE** `/api/tasks/:id`

删除指定的任务。

**路径参数：**

- `id`: 任务 ID

**响应：**

```json
{
  "message": "Task deleted successfully"
}
```

### 5. 获取周期性任务列表

**GET** `/api/tasks/recurring`

获取当前用户的所有周期性任务模板。

**响应：**

```json
{
  "tasks": [
    {
      "id": 2,
      "userId": 1,
      "title": "每日站会",
      "description": "参加团队每日站会",
      "date": "2026-01-11",
      "progressType": "boolean",
      "progressValue": 0,
      "maxProgress": null,
      "isRecurring": true,
      "recurrencePattern": "{\"frequency\":\"daily\",\"interval\":1}",
      "createdAt": "2026-01-11T10:00:00.000Z",
      "updatedAt": "2026-01-11T10:00:00.000Z"
    }
  ]
}
```

### 6. 生成周期性任务

**POST** `/api/tasks/generate-recurring`

为指定日期生成周期性任务实例。

**请求体：**

```json
{
  "date": "2026-01-12"
}
```

**响应：**

```json
{
  "message": "Generated 1 recurring task(s)",
  "tasks": [
    {
      "id": 3,
      "userId": 1,
      "title": "每日站会",
      "description": "参加团队每日站会",
      "date": "2026-01-12",
      "progressType": "boolean",
      "progressValue": 0,
      "maxProgress": null,
      "isRecurring": false,
      "recurrencePattern": null,
      "createdAt": "2026-01-11T10:10:00.000Z",
      "updatedAt": "2026-01-11T10:10:00.000Z"
    }
  ],
  "count": 1
}
```

## 周期性任务配置

### recurrencePattern 格式

周期性任务的 `recurrencePattern` 字段是一个 JSON 字符串，包含以下属性：

```json
{
  "frequency": "daily | weekly | monthly",
  "interval": 1
}
```

- `frequency`: 重复频率
  - `daily`: 每日
  - `weekly`: 每周
  - `monthly`: 每月
- `interval`: 间隔数（必须 >= 1）

### 示例

1. **每天重复：**
   ```json
   {
     "frequency": "daily",
     "interval": 1
   }
   ```

2. **每 3 天重复：**
   ```json
   {
     "frequency": "daily",
     "interval": 3
   }
   ```

3. **每周重复：**
   ```json
   {
     "frequency": "weekly",
     "interval": 1
   }
   ```

4. **每月重复：**
   ```json
   {
     "frequency": "monthly",
     "interval": 1
   }
   ```

## 进度类型

任务支持三种进度类型：

1. **boolean**: 布尔型（完成/未完成）
   - `progressValue`: 0 或 1
   - `maxProgress`: null

2. **numeric**: 数值型（如完成 5/10 个子任务）
   - `progressValue`: 当前进度值
   - `maxProgress`: 最大进度值

3. **percentage**: 百分比型（如完成 50%）
   - `progressValue`: 0-100
   - `maxProgress`: 100

## 错误响应

所有接口可能返回以下错误：

### 400 Bad Request

```json
{
  "error": "错误描述"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized - No token provided"
}
```

或

```json
{
  "error": "Unauthorized - Invalid token"
}
```

### 404 Not Found

```json
{
  "error": "Task not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## 测试

运行以下命令测试所有 API 接口：

```bash
# 启动开发服务器
npm run dev:server

# 运行测试（在另一个终端）
npx tsx test-tasks.ts
```

测试覆盖了所有功能：

1. ✅ 注册用户
2. ✅ 创建普通任务
3. ✅ 创建周期性任务
4. ✅ 获取指定日期的任务列表
5. ✅ 更新任务进度
6. ✅ 获取周期性任务列表
7. ✅ 生成周期性任务
8. ✅ 验证生成的周期性任务
9. ✅ 删除任务
10. ✅ 验证任务已删除
