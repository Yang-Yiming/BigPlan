# BigPlans 部署指南

## 目录
1. [前置要求](#前置要求)
2. [本地开发环境设置](#本地开发环境设置)
3. [数据库设置](#数据库设置)
4. [生产环境部署](#生产环境部署)
5. [环境变量配置](#环境变量配置)
6. [部署验证](#部署验证)
7. [故障排除](#故障排除)

---

## 前置要求

### 必需工具
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Cloudflare 账户**: 用于部署 Workers 和 D1 数据库
- **Wrangler CLI**: Cloudflare Workers 的命令行工具

### 安装 Wrangler
```bash
npm install -g wrangler
```

### 登录 Cloudflare
```bash
wrangler login
```

---

## 本地开发环境设置

### 1. 克隆项目并安装依赖
```bash
git clone <repository-url>
cd BigPlans
npm install
```

### 2. 配置环境变量
复制示例环境文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：
```env
VITE_API_BASE_URL=http://localhost:8787/api
JWT_SECRET=your-development-secret-key
PORT=3000
```

### 3. 启动开发服务器

#### 启动前端开发服务器
```bash
npm run dev
```
访问：http://localhost:5173

#### 启动后端开发服务器
```bash
npm run dev:server
```
或使用 Wrangler:
```bash
npm run wrangler:dev
```

---

## 数据库设置

### 开发环境数据库

#### 1. 创建本地 D1 数据库
```bash
wrangler d1 create bigplans-db
```

#### 2. 更新 wrangler.toml
将输出的 `database_id` 填入 `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bigplans-db"
database_id = "your-database-id-here"
```

#### 3. 生成数据库迁移
```bash
npm run db:generate
```

#### 4. 执行迁移（本地）
```bash
npm run db:migrate
```

#### 5. 查看数据库（可选）
```bash
npm run db:studio
```
访问 Drizzle Studio UI 查看和管理数据库。

### 生产环境数据库

#### 1. 创建生产数据库
```bash
wrangler d1 create bigplans-db-prod
```

#### 2. 更新 wrangler.toml 生产环境配置
```toml
[env.production]
name = "bigplans-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "bigplans-db-prod"
database_id = "your-production-database-id"
```

#### 3. 生成生产环境迁移
```bash
npm run db:generate:prod
```

#### 4. 执行生产环境迁移
```bash
npm run db:migrate:prod
```

---

## 生产环境部署

### 1. 准备生产环境变量

#### 生成强 JWT 密钥
```bash
# 使用 OpenSSL
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 设置 Cloudflare Workers Secret
```bash
wrangler secret put JWT_SECRET --env production
# 输入上面生成的密钥
```

### 2. 配置前端环境变量

创建 `.env.production` 文件：
```env
VITE_API_BASE_URL=https://bigplans-prod.your-subdomain.workers.dev/api
NODE_ENV=production
```

### 3. 构建前端
```bash
npm run build:prod
```

这会：
- 编译 TypeScript
- 构建优化的生产版本
- 移除 console.log
- 启用代码分割
- 压缩代码

### 4. 部署到 Cloudflare Workers
```bash
wrangler deploy --env production
```

或使用 npm 脚本：
```bash
npm run wrangler:deploy
```

### 5. 部署前端静态文件

#### 选项 A: Cloudflare Pages
```bash
# 安装 Wrangler Pages 插件
npm install -D @cloudflare/pages-plugin-static-assets

# 部署
wrangler pages deploy dist --project-name=bigplans-frontend
```

#### 选项 B: 其他静态托管
将 `dist` 目录上传到：
- Vercel
- Netlify
- AWS S3 + CloudFront
- 任何支持 SPA 的静态托管服务

**重要**: 确保配置 SPA 路由回退到 `index.html`

---

## 环境变量配置

### Cloudflare Workers 环境变量

#### 开发环境 (wrangler.toml)
```toml
[vars]
ENVIRONMENT = "development"
```

#### 生产环境 (wrangler.toml)
```toml
[env.production.vars]
ENVIRONMENT = "production"
```

#### Secrets（敏感信息）
通过 Wrangler CLI 设置：
```bash
# JWT 密钥
wrangler secret put JWT_SECRET --env production

# 其他敏感配置（如需要）
wrangler secret put DATABASE_PASSWORD --env production
```

### 前端环境变量

所有前端环境变量必须以 `VITE_` 开头：

**开发环境** (`.env`)：
```env
VITE_API_BASE_URL=http://localhost:8787/api
```

**生产环境** (`.env.production`)：
```env
VITE_API_BASE_URL=https://your-worker-url.workers.dev/api
```

---

## 部署验证

### 1. 检查 Workers 部署状态
```bash
wrangler deployments list --env production
```

### 2. 测试 API 端点
```bash
# 健康检查
curl https://bigplans-prod.your-subdomain.workers.dev/api/health

# 注册测试
curl -X POST https://bigplans-prod.your-subdomain.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### 3. 查看日志
```bash
wrangler tail --env production
```

### 4. 验证数据库连接
```bash
# 查询数据库
wrangler d1 execute bigplans-db-prod --command="SELECT * FROM users LIMIT 5" --remote
```

### 5. 检查性能指标
访问 Cloudflare Dashboard:
- Workers & Pages > Your Worker > Metrics
- 查看请求数、错误率、CPU 时间等

---

## 数据库管理

### 备份数据库
```bash
# 导出生产数据库
wrangler d1 export bigplans-db-prod --remote --output=backup.sql
```

### 恢复数据库
```bash
# 从备份恢复
wrangler d1 execute bigplans-db-prod --file=backup.sql --remote
```

### 查询数据库
```bash
# 执行自定义 SQL
wrangler d1 execute bigplans-db-prod --command="SELECT COUNT(*) FROM tasks" --remote
```

---

## 性能优化

### 1. 启用 Cloudflare 缓存
在 `wrangler.toml` 中配置：
```toml
[env.production]
# 添加缓存配置
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### 2. 配置 CORS
在 `src/server/index.ts` 中添加 CORS 中间件：
```typescript
import { cors } from 'hono/cors'

app.use('/api/*', cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))
```

### 3. 数据库索引
确保已执行包含索引的迁移：
```bash
npm run db:migrate:prod
```

### 4. 监控性能
- 使用 Cloudflare Analytics
- 设置告警（错误率、响应时间）
- 定期检查 Workers 使用量

---

## CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build frontend
        run: npm run build:prod
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: production
          command: deploy --env production
```

### 设置 GitHub Secrets
在 GitHub 仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `VITE_API_BASE_URL`: 生产环境 API URL

---

## 故障排除

### 常见问题

#### 1. 数据库连接失败
**症状**: "Database not found" 错误

**解决方案**:
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确认数据库已创建：`wrangler d1 list`
- 验证迁移已执行：`wrangler d1 execute <db> --command="SELECT name FROM sqlite_master WHERE type='table'" --remote`

#### 2. JWT 验证失败
**症状**: "Invalid or expired token" 错误

**解决方案**:
- 确认 JWT_SECRET 已设置：`wrangler secret list --env production`
- 检查前后端使用相同的密钥
- 重新生成并设置密钥

#### 3. CORS 错误
**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
- 在 Workers 中添加 CORS 中间件
- 确保 `Access-Control-Allow-Origin` 头正确设置
- 检查 `credentials: true` 配置

#### 4. 构建失败
**症状**: `npm run build` 失败

**解决方案**:
- 清除缓存：`rm -rf node_modules dist && npm install`
- 检查 TypeScript 错误：`npm run lint`
- 确保所有依赖已安装

#### 5. 部署后页面空白
**症状**: 部署后前端显示空白页

**解决方案**:
- 检查浏览器控制台错误
- 确认 API URL 配置正确
- 验证路由配置支持 SPA

### 调试技巧

#### 查看实时日志
```bash
wrangler tail --env production --format pretty
```

#### 本地测试生产构建
```bash
npm run build:prod
npm run preview
```

#### 检查环境变量
```bash
# Workers 环境变量
wrangler secret list --env production

# 前端环境变量
cat .env.production
```

---

## 安全检查清单

部署前确保：

- [ ] JWT_SECRET 已设置为强随机密钥
- [ ] 生产环境不使用默认密钥
- [ ] CORS 配置限制了允许的源
- [ ] 所有敏感数据通过 Secrets 存储
- [ ] HTTPS 已启用（Cloudflare 默认启用）
- [ ] 数据库访问限制为 Workers
- [ ] 定期更新依赖（`npm audit`）
- [ ] 错误日志不暴露敏感信息
- [ ] 实施了速率限制（建议）
- [ ] 配置了安全响应头

---

## 更新和维护

### 滚动更新
1. 在开发分支测试更改
2. 运行测试：`npm run test:run`
3. 构建：`npm run build:prod`
4. 部署：`wrangler deploy --env production`
5. 监控日志：`wrangler tail --env production`

### 回滚
```bash
# 查看部署历史
wrangler deployments list --env production

# 回滚到特定版本
wrangler rollback --env production --version <version-id>
```

### 数据库迁移
```bash
# 1. 生成新迁移
npm run db:generate:prod

# 2. 在测试环境验证

# 3. 备份生产数据库
wrangler d1 export bigplans-db-prod --remote --output=backup-$(date +%Y%m%d).sql

# 4. 执行迁移
npm run db:migrate:prod

# 5. 验证迁移成功
wrangler d1 execute bigplans-db-prod --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

---

## 监控和告警

### Cloudflare Analytics
- 访问 Cloudflare Dashboard
- Workers & Pages > bigplans-prod > Metrics
- 设置告警规则

### 自定义监控
集成第三方监控服务：
- Sentry（错误跟踪）
- LogRocket（用户会话回放）
- Datadog（性能监控）

### 健康检查
设置外部监控服务定期检查：
```
GET https://bigplans-prod.your-subdomain.workers.dev/api/health
```

---

## 成本估算

### Cloudflare Workers
- **免费套餐**: 100,000 请求/天
- **付费套餐**: $5/月起，10M 请求/月

### Cloudflare D1
- **Alpha 阶段**: 当前免费
- **未来定价**: 基于存储和查询量

### Cloudflare Pages
- **免费套餐**: 无限请求
- **付费套餐**: $20/月（高级功能）

---

## 联系和支持

### 文档
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Vite 文档](https://vitejs.dev/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

### 获取帮助
- GitHub Issues
- Cloudflare Community
- Stack Overflow

---

## 附录

### 有用的命令

```bash
# 开发
npm run dev                  # 启动前端开发服务器
npm run dev:server          # 启动后端开发服务器
npm run wrangler:dev        # 使用 Wrangler 启动开发

# 测试
npm run test                # 运行测试（watch 模式）
npm run test:run            # 运行所有测试
npm run test:coverage       # 生成覆盖率报告

# 构建
npm run build               # 构建前端
npm run build:prod          # 生产环境构建

# 数据库
npm run db:generate         # 生成迁移（开发）
npm run db:generate:prod    # 生成迁移（生产）
npm run db:migrate          # 执行迁移（本地）
npm run db:migrate:prod     # 执行迁移（生产）
npm run db:studio           # 启动数据库 UI

# 部署
npm run wrangler:deploy     # 部署到 Cloudflare Workers

# 代码质量
npm run lint                # 运行 ESLint
npm run lint:fix            # 自动修复 ESLint 错误
npm run format              # 格式化代码
npm run format:check        # 检查代码格式
```

### 环境检查脚本

创建 `scripts/check-env.sh`:
```bash
#!/bin/bash

echo "检查部署环境..."

# 检查 Node 版本
node_version=$(node -v)
echo "✓ Node.js: $node_version"

# 检查 npm 版本
npm_version=$(npm -v)
echo "✓ npm: $npm_version"

# 检查 Wrangler
if command -v wrangler &> /dev/null; then
    wrangler_version=$(wrangler --version)
    echo "✓ Wrangler: $wrangler_version"
else
    echo "✗ Wrangler 未安装"
    exit 1
fi

# 检查 Cloudflare 登录
if wrangler whoami &> /dev/null; then
    echo "✓ Cloudflare 已登录"
else
    echo "✗ 未登录 Cloudflare"
    exit 1
fi

echo ""
echo "环境检查完成！"
```

使用：
```bash
chmod +x scripts/check-env.sh
./scripts/check-env.sh
```

---

**部署愉快！** 🚀
