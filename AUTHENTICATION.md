# 用户认证模块 - 前端实现文档

## 概述

本文档描述了 BigPlans 应用的前端用户认证实现。

## 已实现功能

### 1. 核心模块

#### API 客户端 (`src/lib/api-client.ts`)
- 基于 axios 的 HTTP 客户端配置
- 请求拦截器：自动在请求头中添加 Bearer Token
- 响应拦截器：处理 401 错误，自动登出并重定向到登录页

#### 认证服务 (`src/services/auth.service.ts`)
- `login()` - 用户登录
- `register()` - 用户注册
- `verifyToken()` - 验证 Token 有效性
- `logout()` - 用户登出
- Token 和用户信息的 localStorage 管理

#### 类型定义 (`src/types/auth.ts`)
- `User` - 用户信息接口
- `LoginCredentials` - 登录凭证接口
- `RegisterCredentials` - 注册凭证接口
- `AuthResponse` - 认证响应接口

### 2. React 组件和上下文

#### AuthContext (`src/contexts/AuthContext.tsx`)
- 全局认证状态管理
- 提供 `useAuth()` Hook
- 应用启动时自动验证 Token
- 状态包括：
  - `user` - 当前用户信息
  - `isLoading` - 加载状态
  - `isAuthenticated` - 认证状态
  - `login()` - 登录方法
  - `register()` - 注册方法
  - `logout()` - 登出方法

#### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- 保护需要认证的路由
- 未认证用户自动重定向到登录页
- 验证过程中显示加载状态

#### 页面组件
- `LoginPage` (`src/pages/LoginPage.tsx`) - 登录页面
- `RegisterPage` (`src/pages/RegisterPage.tsx`) - 注册页面
- `HomePage` (`src/pages/HomePage.tsx`) - 主页（受保护）

### 3. 路由配置

在 `App.tsx` 中配置了完整的路由结构：
- `/login` - 登录页面（公开）
- `/register` - 注册页面（公开）
- `/` - 主页（受保护）
- 其他路径重定向到主页

## 使用示例

### 在组件中使用认证

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome {user?.username}</div>;
  }

  return <div>Please login</div>;
}
```

### 发起 API 请求

```tsx
import { apiClient } from './lib/api-client';

// Token 会自动添加到请求头
const response = await apiClient.get('/api/tasks');
```

### 添加受保护路由

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

## 认证流程

1. **应用启动**
   - AuthProvider 检查 localStorage 中的 Token
   - 如果存在 Token，调用 `/api/auth/verify` 验证有效性
   - 验证成功则自动登录，失败则清除缓存

2. **用户登录**
   - 用户在登录页输入凭证
   - 调用 `login()` 方法
   - 成功后 Token 和用户信息存储到 localStorage
   - 重定向到主页

3. **API 请求**
   - 所有请求自动携带 Token
   - 如果收到 401 响应，自动清除认证信息并重定向到登录页

4. **用户登出**
   - 调用 `logout()` 方法
   - 清除 localStorage 中的认证信息
   - 重定向到登录页

## 环境配置

在 `.env` 文件中配置 API 基础 URL：

```bash
VITE_API_BASE_URL=http://localhost:8787/api
```

## 依赖项

- `react-router-dom` - 路由管理
- `axios` - HTTP 客户端

## 安全特性

1. **Token 存储**：使用 localStorage 存储 Token
2. **自动过期处理**：401 响应自动登出
3. **Token 验证**：应用启动时验证 Token 有效性
4. **受保护路由**：未认证用户无法访问保护的页面

## 后续工作

这是前端实现，需要配合后端 API：
- `POST /api/auth/login` - 登录接口
- `POST /api/auth/register` - 注册接口
- `GET /api/auth/verify` - Token 验证接口

后端需要返回以下格式的响应：

```typescript
{
  token: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string | null;
  };
}
```

## 文件清单

```
src/
├── lib/
│   └── api-client.ts          # Axios 配置和拦截器
├── services/
│   └── auth.service.ts        # 认证服务
├── contexts/
│   └── AuthContext.tsx        # 认证上下文和 Hook
├── components/
│   └── ProtectedRoute.tsx     # 受保护路由组件
├── pages/
│   ├── LoginPage.tsx          # 登录页面
│   ├── RegisterPage.tsx       # 注册页面
│   └── HomePage.tsx           # 主页
├── types/
│   └── auth.ts                # 认证相关类型定义
└── App.tsx                    # 路由配置
```

## 构建和测试

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```
