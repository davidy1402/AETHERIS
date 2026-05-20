# 安全与部署模块任务

> 模块目标：保护个人持仓和 API Key，准备 Vercel 部署，并确保生产环境有访问保护。

## 最小任务

- [ ] SEC-001 创建环境变量模板
  - 创建 `.env.example`。
  - 包含 `ANTHROPIC_API_KEY`、`EXCHANGE_RATE_API_KEY`、`APP_PASSWORD`。
  - 验收：新开发环境能按模板配置。

- [ ] SEC-002 确认 `.gitignore` 敏感文件规则
  - 确认 `.env`、`.env.local`、`.env.*.local` 被忽略。
  - 验收：`git status` 不显示本地密钥文件。

- [ ] SEC-003 确认真实持仓提交策略
  - 如果 GitHub 仓库公开，则真实 `portfolio.json` 不提交，只提交示例数据。
  - 如果仓库私有，可按个人需求保留。
  - 验收：README 或注释说明持仓数据处理方式。

- [ ] SEC-004 实现 API Key 缺失检查
  - ExchangeRate-API Key 缺失时返回明确错误。
  - Claude API Key 缺失时返回明确错误。
  - 验收：不会出现模糊的 500 堆栈泄漏。

- [ ] SEC-005 决定访问保护方案
  - 选择 Vercel Password Protection 或 Next.js middleware。
  - 验收：`doc/detailed-design.md` 待确认事项中该项被决策。

- [ ] SEC-006 实现 middleware 密码保护
  - 仅当不使用 Vercel Pro Password Protection 时执行。
  - 使用 `APP_PASSWORD`。
  - 验收：未授权访问被拦截。

- [ ] SEC-007 配置 Vercel 环境变量
  - 在 Vercel 项目中配置 `ANTHROPIC_API_KEY`、`EXCHANGE_RATE_API_KEY`、必要时配置 `APP_PASSWORD`。
  - 验收：生产环境 API Route 能读取环境变量。

- [ ] SEC-008 部署到 Vercel
  - 连接 GitHub 仓库并部署。
  - 验收：生产 URL 可访问。

- [ ] SEC-009 验证生产访问保护
  - 使用未授权浏览器访问生产 URL。
  - 验收：不能直接看到持仓数据。

- [ ] SEC-010 验证生产 API 不泄露密钥
  - 检查 `/api/prices` 和 `/api/analysis` 响应。
  - 验收：响应中没有 API Key、堆栈、完整第三方敏感响应。

## 完成标准

- [ ] 本模块所有任务完成。
- [ ] API Key 不进入前端 bundle。
- [ ] 生产环境有访问保护。
- [ ] 真实个人财务数据不会意外公开。

