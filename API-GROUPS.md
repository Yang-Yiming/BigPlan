# 群组功能 API 文档

## 概述

群组功能允许用户创建群组、邀请其他用户加入，并查看群组成员的任务和 KISS 复盘。

所有群组 API 端点都需要 JWT 认证。在请求头中包含：
```
Authorization: Bearer <token>
```

---

## API 端点

### 1. 创建群组

**POST** `/api/groups`

创建一个新群组并生成唯一的邀请码。创建者自动成为群组成员。

#### 请求体

```json
{
  "name": "我的群组"
}
```

#### 响应

**成功 (201 Created)**

```json
{
  "group": {
    "id": 1,
    "name": "我的群组",
    "inviteCode": "ABC12XYZ",
    "createdAt": "2024-01-15T08:00:00.000Z"
  },
  "member": {
    "id": 1,
    "groupId": 1,
    "userId": 1,
    "joinedAt": "2024-01-15T08:00:00.000Z",
    "showKiss": true
  }
}
```

**错误响应**

- `400 Bad Request` - 群组名称为空或超过 100 个字符
- `401 Unauthorized` - 未提供有效的认证令牌
- `500 Internal Server Error` - 无法生成唯一邀请码或服务器错误

---

### 2. 加入群组

**POST** `/api/groups/join`

通过邀请码加入已存在的群组。

#### 请求体

```json
{
  "inviteCode": "ABC12XYZ"
}
```

#### 响应

**成功 (201 Created)**

```json
{
  "group": {
    "id": 1,
    "name": "我的群组",
    "inviteCode": "ABC12XYZ",
    "createdAt": "2024-01-15T08:00:00.000Z"
  },
  "member": {
    "id": 2,
    "groupId": 1,
    "userId": 2,
    "joinedAt": "2024-01-15T09:00:00.000Z",
    "showKiss": true
  }
}
```

**错误响应**

- `400 Bad Request` - 未提供邀请码
- `401 Unauthorized` - 未提供有效的认证令牌
- `404 Not Found` - 邀请码无效
- `409 Conflict` - 用户已经是该群组成员
- `500 Internal Server Error` - 服务器错误

---

### 3. 获取用户所在的所有群组

**GET** `/api/groups`

获取当前用户加入的所有群组列表。

#### 响应

**成功 (200 OK)**

```json
{
  "groups": [
    {
      "id": 1,
      "name": "我的群组",
      "inviteCode": "ABC12XYZ",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "joinedAt": "2024-01-15T08:00:00.000Z",
      "showKiss": true
    },
    {
      "id": 2,
      "name": "另一个群组",
      "inviteCode": "DEF34UVW",
      "createdAt": "2024-01-16T10:00:00.000Z",
      "joinedAt": "2024-01-16T11:00:00.000Z",
      "showKiss": false
    }
  ]
}
```

**错误响应**

- `401 Unauthorized` - 未提供有效的认证令牌
- `500 Internal Server Error` - 服务器错误

---

### 4. 获取群组成员列表

**GET** `/api/groups/:id/members`

获取指定群组的所有成员信息。只有群组成员可以访问。

#### 路径参数

- `id` (number) - 群组 ID

#### 响应

**成功 (200 OK)**

```json
{
  "members": [
    {
      "id": 1,
      "userId": 1,
      "username": "alice",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "joinedAt": "2024-01-15T08:00:00.000Z",
      "showKiss": true
    },
    {
      "id": 2,
      "userId": 2,
      "username": "bob",
      "avatarUrl": null,
      "joinedAt": "2024-01-15T09:00:00.000Z",
      "showKiss": false
    }
  ]
}
```

**错误响应**

- `400 Bad Request` - 群组 ID 无效
- `401 Unauthorized` - 未提供有效的认证令牌
- `403 Forbidden` - 用户不是该群组成员
- `500 Internal Server Error` - 服务器错误

---

### 5. 更新群组设置

**PUT** `/api/groups/:id/settings`

更新当前用户在指定群组中的设置（例如是否显示 KISS 复盘）。

#### 路径参数

- `id` (number) - 群组 ID

#### 请求体

```json
{
  "showKiss": false
}
```

#### 响应

**成功 (200 OK)**

```json
{
  "member": {
    "id": 1,
    "groupId": 1,
    "userId": 1,
    "joinedAt": "2024-01-15T08:00:00.000Z",
    "showKiss": false
  }
}
```

**错误响应**

- `400 Bad Request` - 群组 ID 无效、showKiss 不是布尔值或没有提供设置
- `401 Unauthorized` - 未提供有效的认证令牌
- `403 Forbidden` - 用户不是该群组成员
- `500 Internal Server Error` - 服务器错误

---

### 6. 获取群组成员的任务

**GET** `/api/groups/:id/member/:userId/tasks?date=YYYY-MM-DD`

获取群组内指定成员在特定日期的任务列表。只有群组成员可以查看。

#### 路径参数

- `id` (number) - 群组 ID
- `userId` (number) - 目标用户 ID

#### 查询参数

- `date` (string, 必填) - 日期，格式为 `YYYY-MM-DD`

#### 示例请求

```
GET /api/groups/1/member/2/tasks?date=2024-01-15
```

#### 响应

**成功 (200 OK)**

```json
{
  "tasks": [
    {
      "id": 1,
      "userId": 2,
      "title": "完成项目报告",
      "description": "准备季度项目总结报告",
      "date": "2024-01-15",
      "progressType": "boolean",
      "progressValue": 1,
      "maxProgress": null,
      "isRecurring": false,
      "recurrencePattern": null,
      "createdAt": "2024-01-15T07:00:00.000Z",
      "updatedAt": "2024-01-15T16:00:00.000Z"
    },
    {
      "id": 2,
      "userId": 2,
      "title": "健身 30 分钟",
      "description": null,
      "date": "2024-01-15",
      "progressType": "numeric",
      "progressValue": 30,
      "maxProgress": 30,
      "isRecurring": true,
      "recurrencePattern": "{\"frequency\":\"daily\",\"interval\":1}",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T18:30:00.000Z"
    }
  ]
}
```

**错误响应**

- `400 Bad Request` - 群组 ID、用户 ID 或日期格式无效
- `401 Unauthorized` - 未提供有效的认证令牌
- `403 Forbidden` - 请求用户不是该群组成员
- `404 Not Found` - 目标用户不是该群组成员
- `500 Internal Server Error` - 服务器错误

---

## 数据模型

### Group (群组)

```typescript
{
  id: number;                  // 群组 ID
  name: string;                // 群组名称
  inviteCode: string;          // 唯一邀请码（8 位字母数字）
  createdAt: Date;             // 创建时间
}
```

### GroupMember (群组成员)

```typescript
{
  id: number;                  // 成员记录 ID
  groupId: number;             // 群组 ID（外键）
  userId: number;              // 用户 ID（外键）
  joinedAt: Date;              // 加入时间
  showKiss: boolean;           // 是否显示 KISS 复盘（默认：true）
}
```

---

## 邀请码规则

- 长度：8 个字符
- 字符集：大写字母 A-Z 和数字 0-9
- 保证唯一性（系统自动检查）
- 示例：`ABC12XYZ`, `X9Y8Z7W6`

---

## 权限说明

1. **创建群组**：任何认证用户都可以创建群组
2. **加入群组**：任何认证用户都可以通过有效的邀请码加入群组
3. **查看群组列表**：用户只能查看自己加入的群组
4. **查看成员列表**：只有群组成员可以查看该群组的成员列表
5. **更新设置**：用户只能更新自己在群组中的设置
6. **查看成员任务**：只有群组成员可以查看其他成员的任务

---

## 使用示例

### 创建群组流程

```bash
# 1. 用户登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'

# 响应: { "token": "eyJhbGc...", ... }

# 2. 创建群组
curl -X POST http://localhost:3000/api/groups \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"name": "我的团队"}'

# 响应: { "group": { "inviteCode": "ABC12XYZ", ... }, ... }
```

### 加入群组流程

```bash
# 1. 另一个用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "password": "password456"}'

# 2. 使用邀请码加入群组
curl -X POST http://localhost:3000/api/groups/join \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "ABC12XYZ"}'
```

### 查看群组成员任务

```bash
curl -X GET "http://localhost:3000/api/groups/1/member/2/tasks?date=2024-01-15" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 注意事项

1. 所有日期参数必须使用 `YYYY-MM-DD` 格式
2. 邀请码不区分大小写（系统会自动转换为大写）
3. 用户不能重复加入同一个群组
4. 删除群组会级联删除所有群组成员记录（通过数据库外键实现）
5. 删除用户会级联删除该用户的所有群组成员记录
6. `showKiss` 设置是针对每个用户在每个群组中的独立设置

---

## 未来扩展

可能的功能扩展：

1. 群组管理员角色
2. 移除群组成员
3. 解散群组
4. 重新生成邀请码
5. 群组描述和头像
6. 群组成员数量限制
7. 群组公告和消息
