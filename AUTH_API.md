# 用户认证模块 API

用户认证后端 API 已实现，包含注册、登录和获取用户信息功能。

## 已实现的功能

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录（返回 JWT token）
- GET /api/auth/me - 获取当前用户信息（需要认证）
- JWT 认证中间件
- 密码使用 bcrypt 哈希存储

## 启动服务器

```bash
# 开发模式启动后端服务器
npm run dev:server

# 前端开发服务器（如需）
npm run dev
```

服务器将在 http://localhost:3000 启动。

## API 接口文档

### 1. 用户注册

**POST** `/api/auth/register`

**请求体：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**验证规则：**
- `username` 至少 3 个字符
- `password` 至少 6 个字符
- `username` 必须唯一

**成功响应（201）：**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "createdAt": "2026-01-11T07:43:11.000Z"
  }
}
```

**错误响应：**
- 400 - 缺少必需字段或验证失败
- 409 - 用户名已存在

### 2. 用户登录

**POST** `/api/auth/login`

**请求体：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**成功响应（200）：**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "avatarUrl": null,
    "createdAt": "2026-01-11T07:43:11.000Z"
  }
}
```

**错误响应：**
- 400 - 缺少必需字段
- 401 - 用户名或密码错误

### 3. 获取当前用户信息

**GET** `/api/auth/me`

**请求头：**
```
Authorization: Bearer <token>
```

**成功响应（200）：**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "avatarUrl": null,
    "createdAt": "2026-01-11T07:43:11.000Z"
  }
}
```

**错误响应：**
- 401 - 未提供 token 或 token 无效
- 404 - 用户不存在

## 测试

运行自动化测试：

```bash
tsx test-auth.ts
```

测试覆盖：
- 用户注册
- 用户登录
- 无效凭证登录
- 获取当前用户信息
- 未授权访问
- 重复用户名注册

## 项目结构

```
src/
├── server/
│   ├── index.ts           # 服务器主入口
│   ├── dev.ts            # 开发服务器启动脚本
│   ├── routes/
│   │   └── auth.ts       # 认证路由
│   ├── middleware/
│   │   └── auth.ts       # JWT 认证中间件
│   └── utils/
│       ├── jwt.ts        # JWT 工具函数
│       └── password.ts   # 密码哈希工具函数
└── db/
    ├── schema/
    │   └── users.ts      # 用户表结构
    └── client.ts         # 数据库客户端
```

## 环境变量

可以在 `.env` 文件中配置：

```env
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

## 安全特性

- 密码使用 bcrypt 哈希（salt rounds: 10）
- JWT token 有效期：7 天
- 输入验证（用户名、密码长度）
- SQL 注入防护（使用 Drizzle ORM）
- CORS 配置

## 使用示例

### 注册并登录

```bash
# 注册新用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 获取当前用户信息
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```
