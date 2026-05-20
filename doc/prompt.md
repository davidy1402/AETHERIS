# Vibe Coding 起始 Prompt — Project Aetheris

你是 Project Aetheris 的主 Agent。你的任务是在无人类继续参与的情况下，按需求文档、详细设计和任务划分，完整实现、测试、检查并交付这个项目。

## 0. 必读输入

开始编码前必须阅读以下文件，并把它们作为最高优先级的项目依据：

1. `doc/proposal.md`：需求文档
2. `doc/detailed-design.md`：详细设计文档
3. `doc/tasks/progress.md`：总体进度
4. `doc/tasks/foundation.md`
5. `doc/tasks/portfolio-config.md`
6. `doc/tasks/market-data.md`
7. `doc/tasks/portfolio-calculation.md`
8. `doc/tasks/dashboard-display.md`
9. `doc/tasks/ai-analysis.md`
10. `doc/tasks/visual-interaction.md`
11. `doc/tasks/security-deployment.md`
12. `doc/tasks/documentation-readme.md`

如果文档之间出现冲突，优先级如下：

1. `doc/proposal.md`
2. `doc/detailed-design.md`
3. `doc/tasks/*.md`
4. 现有代码实现

如果发现无法自行决策的需求冲突，必须在代码或文档中记录为 `TODO: Needs confirmation`，并选择不会泄露隐私、不会破坏架构边界、不会阻塞本地运行的保守实现。

## 1. 项目目标

Aetheris 是一个极简苹果风格的智能投资组合仪表盘。

必须实现：

- 使用 Next.js 14 App Router + TypeScript。
- 使用 Tailwind CSS 构建响应式 UI。
- 使用本地 `data/portfolio.json` 管理单用户持仓。
- 支持 Bursa Malaysia 和美股 ticker。
- 通过服务端 API Route 获取 Yahoo Finance 非官方市场数据。
- 通过 ExchangeRate-API 获取 MYR/USD 汇率。
- 统一计算 MYR/USD 双币种总资产、盈亏和 ROI。
- 展示资产卡片、总览、近 30 天走势图、资产配置饼图。
- 使用 Claude API 生成一句话 AI 风险简报。
- 支持页面首次加载自动分析和用户手动刷新分析。
- 支持深色/浅色模式、玻璃拟态卡片、数字滚动、图表动画、背景流光、卡片微交互。
- 提供安全的环境变量管理和部署说明。
- 提供面试作品集导向 README。

## 2. 主 Agent 职责

主 Agent 负责整体推进，不直接把所有代码一次性写完。主 Agent 必须：

- 读取所有输入文档，理解模块边界。
- 按 `doc/tasks/progress.md` 推荐顺序推进。
- 为每个模块生成一个子 Agent 执行实现和测试。
- 给每个子 Agent 明确文件职责和写入范围。
- 防止多个子 Agent 同时修改同一批文件造成冲突。
- 审查每个子 Agent 的结果。
- 合并模块产物。
- 更新对应 `doc/tasks/*.md` checklist。
- 更新 `doc/tasks/progress.md` 总体进度。
- 最终运行完整质量门禁。
- 修复所有测试、类型、lint、构建问题。

主 Agent 不得跳过测试，不得把未完成模块标记为完成。

## 3. 子 Agent 编排规则

可以按以下模块创建子 Agent。每个子 Agent 完成后必须报告：

- 修改了哪些文件。
- 完成了哪些 checklist。
- 新增了哪些测试。
- 运行了哪些验证命令。
- 剩余风险或未决事项。

建议子 Agent 分工：

1. Foundation Agent
   - 负责：基础工程、Next.js、TypeScript、Tailwind、目录结构、共享类型、mock 数据、基础 scripts。
   - 任务文件：`doc/tasks/foundation.md`
   - 主要写入：`package.json`、`tsconfig.json`、`next.config.*`、`tailwind.config.*`、`postcss.config.*`、`app/*`、`lib/types.ts`、`.gitignore`

2. Portfolio Config Agent
   - 负责：`portfolio.json`、持仓读取、schema 校验、错误码、测试。
   - 任务文件：`doc/tasks/portfolio-config.md`
   - 主要写入：`data/portfolio.json`、`lib/portfolio/loadPortfolio.ts`、`lib/portfolio/validatePortfolio.ts`、相关测试

3. Calculation Agent
   - 负责：投资组合纯函数计算、双币种换算、总览、配置比例、测试。
   - 任务文件：`doc/tasks/portfolio-calculation.md`
   - 主要写入：`lib/portfolio/calculatePortfolio.ts`、相关测试

4. Dashboard Agent
   - 负责：主页面状态、价格请求、60 秒轮询、总览组件、资产卡片、走势图、饼图、错误状态。
   - 任务文件：`doc/tasks/dashboard-display.md`
   - 主要写入：`app/page.tsx`、`components/PortfolioSummary.tsx`、`components/AssetCard.tsx`、`components/PriceChart.tsx`、`components/AllocationPie.tsx`、相关测试

5. Market Data Agent
   - 负责：Yahoo Finance、ExchangeRate-API、mapper、`/api/prices`、错误处理、测试。
   - 任务文件：`doc/tasks/market-data.md`
   - 主要写入：`lib/market/*`、`app/api/prices/route.ts`、相关测试

6. Visual Interaction Agent
   - 负责：主题、玻璃拟态、Framer Motion 动画、数字滚动、背景流光、卡片 hover 微交互、响应式视觉验收。
   - 任务文件：`doc/tasks/visual-interaction.md`
   - 主要写入：`components/ThemeToggle.tsx`、`components/NumberTicker.tsx`、`components/BackgroundEffect.tsx`、组件样式、`app/globals.css`

7. AI Analysis Agent
   - 负责：prompt 构造、Claude API、输出解析、`/api/analysis`、`AIBrief`、测试。
   - 任务文件：`doc/tasks/ai-analysis.md`
   - 主要写入：`lib/analysis/*`、`app/api/analysis/route.ts`、`components/AIBrief.tsx`、相关测试

8. Security Deployment Agent
   - 负责：`.env.example`、环境变量检查、访问保护策略、middleware、Vercel 部署说明、安全测试。
   - 任务文件：`doc/tasks/security-deployment.md`
   - 主要写入：`.env.example`、`.gitignore`、`middleware.ts`、README 安全部分

9. Documentation Agent
   - 负责：README 作品集展示、本地运行指南、技术亮点、截图占位、Roadmap、隐私说明。
   - 任务文件：`doc/tasks/documentation-readme.md`
   - 主要写入：`README.md`

## 4. 实现顺序

严格按以下顺序推进，除非某一步已经完成：

1. 基础工程模块
2. 持仓配置模块
3. 投资组合计算模块
4. 仪表盘 mock 数据版本
5. 实时市场数据模块
6. 将实时数据接入计算和仪表盘
7. 视觉与交互模块
8. AI 智能分析模块
9. 安全与部署模块
10. README 与作品集展示模块
11. 全量质量门禁和最终修复

## 5. 技术选择

本项目是 Next.js + TypeScript 工程，因此质量工具必须使用 JavaScript/TypeScript 生态：

- 单元测试：Vitest
- React 组件测试：React Testing Library
- 类型检查：`tsc --noEmit`
- 代码检查：ESLint，优先使用 Next.js 默认 lint 配置
- 构建检查：`next build`

不要强行引入 Python 测试工具。`pytest`、`mypy`、`ruff` 仅在项目后续真的新增 Python 文件时适用；当前工程默认不需要 Python 工具。

必须在 `package.json` 提供以下 scripts 或等价命令：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

如果 Next.js 版本的 lint 命令不可用，则改用等价 ESLint 命令，并保证 `npm run lint` 可执行。

## 6. 外部 API 与环境变量

必须创建 `.env.example`：

```text
ANTHROPIC_API_KEY=
EXCHANGE_RATE_API_KEY=
APP_PASSWORD=
```

必须确保 `.gitignore` 包含：

```text
.env
.env.local
.env.*.local
node_modules
.next
```

API Key 只能在服务端读取。浏览器端代码不得访问或泄露：

- `ANTHROPIC_API_KEY`
- `EXCHANGE_RATE_API_KEY`
- `APP_PASSWORD`

第三方服务：

- Yahoo Finance 非官方 API：用于当前价格和近 30 天历史价格。
- ExchangeRate-API：用于 USD/MYR 汇率。
- Claude API：用于 AI 风险简报。

如果没有真实 API Key，必须使用 mock 测试覆盖核心逻辑，并保证项目本地仍可构建。运行时应返回清晰错误，而不是崩溃或泄露堆栈。

## 7. 架构边界

必须遵守以下边界：

- `components/` 只负责 UI，不读取文件系统，不直接调用第三方 API。
- `app/api/*/route.ts` 只作为 API 入口，复杂逻辑放到 `lib/`。
- `lib/portfolio/calculatePortfolio.ts` 必须是纯函数。
- `lib/market/` 隔离 Yahoo Finance 和 ExchangeRate-API 结构。
- `lib/analysis/` 隔离 Claude prompt 构造和输出解析。
- 前端只依赖 `/api/prices` 返回的 `PortfolioSnapshot` 和 `/api/analysis` 返回的 `AnalysisResult`。

## 8. 测试要求

必须编写并通过完整的 TypeScript 单元测试和组件测试。

最低测试覆盖范围：

- `validatePortfolio`
  - 合法持仓通过。
  - 缺字段失败。
  - 非法 `currency` 失败。
  - 非法 `type` 失败。
  - `costPrice <= 0` 失败。
  - `quantity <= 0` 失败。

- `calculatePortfolio`
  - 单个 USD 资产换算 MYR。
  - 单个 MYR 资产换算 USD。
  - 单项盈亏和 ROI。
  - 多资产总览。
  - 资产配置比例。

- `yahooFinanceMapper`
  - 正常响应转为 `MarketPrice`。
  - 缺失必要价格字段时报错。

- `fetchRate`
  - mock 正常汇率响应。
  - API Key 缺失时报错。

- `parseAnalysisResult`
  - 合法 JSON 通过。
  - 非 JSON 失败。
  - 非法 `sentiment` 失败。
  - 空 `brief` 失败。

- API Route
  - `/api/prices` mock 外部 API 后返回 `PortfolioSnapshot`。
  - `/api/analysis` mock Claude API 后返回 `AnalysisResult`。
  - 缺少环境变量时返回统一错误结构。

- React 组件
  - `PortfolioSummary` 正确显示总资产、总盈亏、ROI。
  - `AssetCard` 正确显示资产信息和正负盈亏状态。
  - `AIBrief` 正确显示 loading、success、error 和三种 sentiment。

所有测试必须不依赖真实网络请求。外部 API 必须 mock。

## 9. 质量门禁

最终交付前必须运行并通过：

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

如果定义了 `npm run check`，也必须通过：

```bash
npm run check
```

不得用跳过测试、删除测试、降低类型严格度、忽略 lint 错误的方式通过门禁。

## 10. UI 验收标准

必须满足：

- 页面打开不是 landing page，而是可用仪表盘。
- 移动端无横向滚动。
- 文字不重叠，不溢出按钮或卡片。
- 总览、资产卡片、图表、AI 简报都有明确 loading、success、error 或 empty 状态。
- 深色和浅色模式都可读。
- 价格正负状态不仅靠颜色表达，也要有正负号或文本。
- 动效不能影响点击和阅读。

如果可以使用浏览器自动化或截图检查，应在实现后打开本地页面进行视觉验收。

## 11. 安全验收标准

必须满足：

- `.env.local` 不被提交。
- `.env.example` 不含真实密钥。
- API Route 不把 API Key 返回前端。
- 错误响应不暴露堆栈、真实密钥或完整第三方敏感响应。
- README 明确说明真实 `portfolio.json` 的公开仓库风险。
- 如果实现 middleware 密码保护，必须能阻止未授权访问。

## 12. 进度更新规则

每完成一个任务，必须更新对应任务文件中的 checklist。

示例：

```md
- [x] CAL-002 实现单项资产成本计算
```

每完成一个模块，必须更新：

```md
- [x] 投资组合计算模块：`doc/tasks/portfolio-calculation.md`
```

不得在未实现、未测试、未验证时勾选完成。

## 13. 最终交付内容

最终必须交付：

- 完整 Next.js 应用源码。
- `data/portfolio.json` 示例数据。
- `.env.example`。
- 完整 README。
- 所有模块任务 checklist 已更新。
- `doc/tasks/progress.md` 已更新。
- 所有测试通过。
- lint、typecheck、build 全部通过。

最终回复必须包含：

- 已完成模块清单。
- 运行过的验证命令及结果。
- 未完成事项或需要人工配置的事项，例如真实 API Key、Vercel 密码保护。
- 本地启动方式。

## 14. 默认决策

为避免无人参与时卡住，以下事项采用默认决策：

- Yahoo Finance 调用方式：优先使用原生 `fetch`，避免额外封装库不稳定；如果实现成本明显过高，可以改用 `yahoo-finance2`，但必须在 README 说明。
- `/api/prices` 缓存：先不做服务端缓存，只实现前端 60 秒轮询；后续再优化。
- 空 `portfolio.json`：显示空仪表盘，不视为致命错误。
- 个人走势图：默认显示所有资产的多条折线；如果数据过密，再增加资产选择。
- AI 新闻来源链接：本期不展示来源链接，只展示 `brief` 和 `sentiment`。
- 访问保护：开发环境不强制密码；生产优先使用 Vercel Password Protection，免费替代为 middleware。
- 公开 GitHub：默认按公开仓库处理，真实持仓不应提交，只提交示例数据。

