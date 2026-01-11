# BigPlans

一个现代化的全栈任务管理应用，基于 Cloudflare Workers、D1 数据库、React 和 TypeScript 构建。

[![Deploy to Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-orange)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发](#开发)
- [测试](#测试)
- [部署](#部署)
- [API 文档](#api-文档)
- [安全](#安全)

## 功能特性

### 核心功能
- ✅ **用户认证系统** - 注册、登录、JWT 令牌验证
- ✅ **任务管理** - 创建、编辑、删除任务，支持多种进度类型
- ✅ **周期性任务** - 支持每日、每周、每月的重复任务
- ✅ **KISS 反思** - 每日反思记录（Keep, Improve, Start, Stop）
- ✅ **评论系统** - 任务评论和每日评论
- ✅ **群组功能** - 创建群组，邀请成员，共享任务
- ✅ **响应式设计** - 移动端和桌面端自适应

### 技术亮点
- 🚀 **边缘计算** - Cloudflare Workers 全球部署
- 💾 **无服务器数据库** - Cloudflare D1 (SQLite)
- 🔒 **安全性** - JWT 认证、密码哈希、SQL 注入防护
- ⚡ **高性能** - 数据库索引优化、代码分割、CDN 加速
- 🧪 **测试覆盖** - 单元测试、组件测试
- 📦 **类型安全** - 端到端 TypeScript
- 🎨 **现代 UI** - Tailwind CSS v4

## 技术栈

### 前端
- **框架**: React 19
- **构建工具**: Vite 7
- **语言**: TypeScript 5.9
- **样式**: Tailwind CSS v4
- **路由**: React Router v7
- **HTTP 客户端**: Axios
- **测试**: Vitest + Testing Library

### 后端
- **运行时**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **认证**: JWT (jsonwebtoken)
- **密码**: bcryptjs

### 开发工具
- **代码质量**: ESLint + Prettier
- **类型检查**: TypeScript
- **数据库工具**: Drizzle Kit + Studio
- **部署**: Wrangler CLI
- **CI/CD**: GitHub Actions

## 快速开始

### 前置要求

- Node.js 18+
- npm 9+
- Cloudflare 账户（用于部署）

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd BigPlans

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

### 配置

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8787/api
JWT_SECRET=your-development-secret-key
PORT=3000
```

### 启动开发服务器

```bash
# 启动前端（端口 5173）
npm run dev

# 启动后端（端口 8787）
npm run dev:server

# 或使用 Wrangler
npm run wrangler:dev
```

访问：
- 前端：http://localhost:5173
- 后端 API：http://localhost:8787/api

### 数据库设置

```bash
# 生成数据库迁移
npm run db:generate

# 执行迁移
npm run db:migrate

# 打开数据库管理界面
npm run db:studio
```

## 项目结构

```
BigPlans/
├── src/
│   ├── components/         # React 组件
│   │   ├── TaskCard.tsx
│   │   ├── FormField.tsx
│   │   ├── CommentForm.tsx
│   │   └── ...
│   ├── contexts/          # React Context
│   │   └── AuthContext.tsx
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── services/          # API 服务
│   │   └── auth.service.ts
│   ├── lib/               # 工具库
│   │   └── api-client.ts
│   ├── server/            # 后端代码
│   │   ├── routes/        # API 路由
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── comments.ts
│   │   │   └── groups.ts
│   │   ├── middleware/    # 中间件
│   │   │   └── auth.ts
│   │   ├── utils/         # 工具函数
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── recurring-tasks.ts
│   │   └── index.ts       # Workers 入口
│   ├── db/                # 数据库
│   │   ├── schema/        # 数据库 Schema
│   │   │   ├── users.ts
│   │   │   ├── tasks.ts
│   │   │   ├── comments.ts
│   │   │   └── groups.ts
│   │   └── client.ts
│   └── test/              # 测试文件
│       ├── components/
│       └── utils/
├── drizzle/               # 数据库迁移
├── .github/
│   └── workflows/         # CI/CD
│       └── deploy.yml
├── wrangler.toml          # Cloudflare Workers 配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.js     # Tailwind 配置
└── package.json
```

## 开发

### 可用命令

```bash
# 开发
npm run dev                 # 启动前端开发服务器
npm run dev:server         # 启动后端开发服务器
npm run wrangler:dev       # 使用 Wrangler 启动

# 构建
npm run build              # 构建前端
npm run build:prod         # 生产环境构建

# 测试
npm run test               # 运行测试（watch 模式）
npm run test:run           # 运行所有测试
npm run test:ui            # 测试 UI
npm run test:coverage      # 生成测试覆盖率报告

# 代码质量
npm run lint               # 运行 ESLint
npm run lint:fix           # 自动修复 lint 错误
npm run format             # 格式化代码
npm run format:check       # 检查代码格式

# 数据库
npm run db:generate        # 生成迁移（开发）
npm run db:generate:prod   # 生成迁移（生产）
npm run db:migrate         # 执行迁移（本地）
npm run db:migrate:prod    # 执行迁移（生产）
npm run db:studio          # 启动数据库管理 UI
npm run db:push            # 推送 schema 到数据库
npm run db:drop            # 删除迁移

# 部署
npm run wrangler:deploy    # 部署到 Cloudflare Workers
```

### 代码风格

项目使用 ESLint 和 Prettier 保证代码质量：

```bash
# 检查代码风格
npm run lint
npm run format:check

# 自动修复
npm run lint:fix
npm run format
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm run test:run

# Watch 模式
npm run test

# 生成覆盖率报告
npm run test:coverage

# 测试 UI
npm run test:ui
```

### 测试文件结构

```
src/test/
├── setup.ts                    # 测试设置
├── components/
│   └── FormField.test.tsx     # 组件测试
└── utils/
    ├── password.test.ts       # 密码工具测试
    └── jwt.test.ts            # JWT 工具测试
```

### 编写测试

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 部署

详细的部署文档请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署

```bash
# 1. 创建生产数据库
wrangler d1 create bigplans-db-prod

# 2. 更新 wrangler.toml 中的 database_id

# 3. 执行数据库迁移
npm run db:migrate:prod

# 4. 设置 JWT 密钥
wrangler secret put JWT_SECRET --env production

# 5. 构建前端
npm run build:prod

# 6. 部署
npm run wrangler:deploy
```

### CI/CD

项目包含 GitHub Actions 工作流，自动执行：
- 代码检查（Lint）
- 测试
- 构建
- 部署到 Cloudflare Workers

配置位置：`.github/workflows/deploy.yml`

## API 文档

### 认证

#### POST `/api/auth/register`
注册新用户

```json
// 请求
{
  "username": "user123",
  "password": "password123"
}

// 响应
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "user123",
    "createdAt": 1704067200
  }
}
```

#### POST `/api/auth/login`
用户登录

```json
// 请求
{
  "username": "user123",
  "password": "password123"
}

// 响应
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "user123",
    "avatarUrl": null,
    "createdAt": 1704067200
  }
}
```

#### GET `/api/auth/me`
获取当前用户信息（需要认证）

```json
// 响应
{
  "user": {
    "id": 1,
    "username": "user123",
    "avatarUrl": null,
    "createdAt": 1704067200
  }
}
```

### 任务

#### POST `/api/tasks`
创建任务（需要认证）

```json
// 请求
{
  "title": "完成项目文档",
  "description": "编写 README 和部署文档",
  "date": "2026-01-15",
  "progressType": "boolean",
  "isRecurring": false
}
```

#### GET `/api/tasks?date=YYYY-MM-DD`
获取指定日期的任务（需要认证）

#### PUT `/api/tasks/:id`
更新任务（需要认证）

#### DELETE `/api/tasks/:id`
删除任务（需要认证）

更多 API 文档请参考源代码中的路由文件。

## 安全

项目实施了多层安全措施：

### 已实现的安全特性

- ✅ **SQL 注入防护** - 使用 Drizzle ORM 参数化查询
- ✅ **XSS 防护** - React 自动转义 + 输入验证
- ✅ **密码安全** - bcryptjs 哈希（salt rounds = 10）
- ✅ **JWT 认证** - 令牌验证和过期控制
- ✅ **输入验证** - 所有 API 端点验证输入
- ✅ **用户所有权验证** - 防止未授权访问
- ✅ **HTTPS** - Cloudflare 强制 HTTPS

### 安全建议

查看完整的安全审计报告：[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

### 报告安全问题

如果发现安全漏洞，请通过 [安全邮箱] 私密报告，而不是公开 issue。

## 性能优化

项目实施了多项性能优化：

- ✅ **数据库索引** - 优化常用查询
- ✅ **代码分割** - React vendor、日期库分离
- ✅ **Tree Shaking** - 移除未使用代码
- ✅ **压缩** - Terser 压缩 JavaScript
- ✅ **边缘计算** - Cloudflare Workers 全球分发
- ✅ **缓存策略** - 适当的缓存头部

查看详细的性能优化文档：[DATABASE_OPTIMIZATION.md](./DATABASE_OPTIMIZATION.md)

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献指南

- 遵循现有的代码风格
- 添加测试覆盖新功能
- 更新相关文档
- 确保所有测试通过
- 保持提交信息清晰

## 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

## 联系方式

- 项目链接: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 文档: [Documentation]

## 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的 ORM
- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Vite](https://vitejs.dev/) - 快速的前端构建工具
- [React](https://react.dev/) - UI 库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

**Built with ❤️ using Cloudflare Workers**

