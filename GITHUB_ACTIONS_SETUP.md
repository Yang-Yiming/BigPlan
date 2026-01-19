# GitHub Actions 自动部署设置指南

## ✅ 已完成
- GitHub Actions workflow 文件已创建在 `.github/workflows/deploy.yml`
- 每次推送到 `main` 分支时会自动触发部署

## 📝 需要配置的 GitHub Secrets

你需要在 GitHub 仓库中添加以下两个 Secrets：

### 1. CLOUDFLARE_ACCOUNT_ID
**值**: `d0752d38aec6d4f3868de2f4cdd81567`

### 2. CLOUDFLARE_API_TOKEN
需要从 Cloudflare 创建一个 API Token

---

## 🔑 获取 Cloudflare API Token

### 步骤 1: 访问 Cloudflare API Tokens 页面
打开浏览器访问: https://dash.cloudflare.com/profile/api-tokens

### 步骤 2: 创建新的 API Token
1. 点击 "Create Token" 按钮
2. 找到 "Edit Cloudflare Workers" 模板
3. 点击 "Use template"

### 步骤 3: 配置权限
确保包含以下权限：
- **Account** -> **Cloudflare Workers Scripts** -> **Edit**
- **Account** -> **Cloudflare D1** -> **Edit**

### 步骤 4: 账户资源
- **Account Resources**: Include -> 选择你的账户

### 步骤 5: 继续并创建
1. 点击 "Continue to summary"
2. 点击 "Create Token"
3. **重要**: 复制生成的 Token（只会显示一次！）

---

## 🔐 在 GitHub 中添加 Secrets

### 步骤 1: 打开仓库设置
访问你的 GitHub 仓库: https://github.com/Yang-Yiming/BigPlan

### 步骤 2: 进入 Secrets 页面
1. 点击 "Settings" 标签
2. 在左侧菜单找到 "Secrets and variables"
3. 点击 "Actions"

### 步骤 3: 添加 CLOUDFLARE_ACCOUNT_ID
1. 点击 "New repository secret"
2. Name: `CLOUDFLARE_ACCOUNT_ID`
3. Secret: `d0752d38aec6d4f3868de2f4cdd81567`
4. 点击 "Add secret"

### 步骤 4: 添加 CLOUDFLARE_API_TOKEN
1. 再次点击 "New repository secret"
2. Name: `CLOUDFLARE_API_TOKEN`
3. Secret: 粘贴你在 Cloudflare 创建的 API Token
4. 点击 "Add secret"

---

## 🚀 测试自动部署

配置完成后，有两种方式测试：

### 方式 1: 推送此配置文件
```bash
git add .github/workflows/deploy.yml GITHUB_ACTIONS_SETUP.md
git commit -m "ci: add GitHub Actions auto-deploy workflow"
git push
```

### 方式 2: 在 GitHub 网页手动触发
1. 访问仓库的 "Actions" 标签
2. 选择 "Deploy to Cloudflare Workers" workflow
3. 点击 "Run workflow"

---

## 📊 查看部署状态

推送后：
1. 访问 https://github.com/Yang-Yiming/BigPlan/actions
2. 查看最新的 workflow run
3. 可以实时查看部署日志

---

## ⚙️ 工作流程说明

每次推送到 `main` 分支时，GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 安装 Bun 和依赖
3. ✅ 运行数据库迁移（如果有新的迁移）
4. ✅ 构建生产环境版本
5. ✅ 部署到 Cloudflare Workers

整个过程大约需要 2-3 分钟。

---

## 🐛 常见问题

### 问题 1: 部署失败 - Authentication error
- 检查 CLOUDFLARE_API_TOKEN 是否正确配置
- 确认 Token 权限是否包含 Workers 和 D1

### 问题 2: 数据库迁移失败
- 检查 CLOUDFLARE_ACCOUNT_ID 是否正确
- 确认 Token 权限包含 D1 Edit

### 问题 3: 构建失败
- 查看 Actions 日志中的具体错误信息
- 确保本地 `bun run build:prod` 可以成功运行

---

## 💡 提示

- API Token 只会显示一次，请妥善保管
- 如果丢失，需要重新创建新的 Token
- Secrets 配置后无法查看，只能更新或删除
- 可以随时在 Actions 页面查看历史部署记录
