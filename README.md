# PlanCake 🥞

一个温馨可爱的全栈任务管理应用，带有清新淡雅的香草煎饼主题，基于 Cloudflare Workers 和 React 构建。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-orange)](https://workers.cloudflare.com)

## ✨ 功能特性

- **任务管理** - 创建、编辑、删除任务，支持多种进度类型（布尔、数值、百分比）
- **周期性任务** - 支持每日、每周、每月的重复任务
- **KISS 复盘** - 每日反思记录（Keep, Improve, Start, Stop）
- **群组协作** - 创建群组，邀请成员，共享任务和复盘
- **评论系统** - 任务评论和每日评论
- **响应式设计** - 完美适配移动端和桌面端

## 🚀 技术栈

**前端**
- React 19 + TypeScript
- Vite 7 + Tailwind CSS v4
- React Router v7

**后端**
- Cloudflare Workers + Hono
- Cloudflare D1 (SQLite)
- Drizzle ORM
- JWT 认证

## 📦 快速开始

### 前置要求

- Node.js 18+
- npm 9+
- Cloudflare 账户（用于部署）

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8787/api
JWT_SECRET=your-development-secret-key
PORT=3000
```

### 本地开发

```bash
# 启动前端开发服务器（端口 5173）
npm run dev

# 启动后端开发服务器（端口 8787）
npm run dev:server
```

访问 http://localhost:5173

### 数据库设置

```bash
# 生成并执行数据库迁移
npm run db:generate
npm run db:migrate

# 打开数据库管理界面
npm run db:studio
```

## 📖 文档

查看 [本地测试与部署指南](./部署指南.md) 了解详细的使用和部署说明。

## 🏗️ 项目结构

```
BigPlans/
├── src/
│   ├── components/     # React 组件
│   ├── pages/          # 页面组件
│   ├── contexts/       # React Context
│   ├── services/       # API 服务
│   ├── server/         # 后端代码
│   │   ├── routes/     # API 路由
│   │   ├── middleware/ # 中间件
│   │   └── utils/      # 工具函数
│   ├── db/             # 数据库
│   │   ├── schema/     # 数据库表结构
│   │   └── client.ts   # 数据库客户端
│   └── utils/          # 工具函数
├── drizzle/            # 数据库迁移文件
├── wrangler.toml       # Cloudflare 配置
└── package.json
```

## 📝 常用命令

```bash
# 开发
npm run dev              # 启动前端
npm run dev:server       # 启动后端

# 构建
npm run build            # 构建前端
npm run build:prod       # 生产环境构建

# 测试
npm run test             # 运行测试
npm run test:coverage    # 生成覆盖率报告

# 数据库
npm run db:generate      # 生成迁移
npm run db:migrate       # 执行迁移
npm run db:studio        # 数据库管理 UI

# 部署
npm run wrangler:deploy  # 部署到 Cloudflare
```

## 🔒 安全特性

- SQL 注入防护（Drizzle ORM 参数化查询）
- XSS 防护（React 自动转义）
- 密码加密（bcryptjs）
- JWT 认证
- HTTPS 强制（Cloudflare）

## 📄 许可证

MIT License

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [React](https://react.dev/)
- [Hono](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
