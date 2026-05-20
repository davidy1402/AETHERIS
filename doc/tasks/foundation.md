# 基础工程模块任务

> 模块目标：搭建可运行的 Next.js 14 + TypeScript + Tailwind CSS 项目骨架，并建立后续模块共享的目录、类型和 mock 数据基础。

## 最小任务

- [ ] FND-001 初始化 Next.js 14 App Router 项目
  - 创建 `package.json`、`app/`、`app/layout.tsx`、`app/page.tsx`。
  - 启用 TypeScript。
  - 验收：`npm run dev` 能启动首页。

- [ ] FND-002 接入 Tailwind CSS
  - 创建 Tailwind 配置和 `app/globals.css`。
  - 在 `layout.tsx` 引入全局样式。
  - 验收：首页能渲染 Tailwind class 样式。

- [ ] FND-003 建立项目目录结构
  - 创建 `components/`、`data/`、`lib/`、`lib/portfolio/`、`lib/market/`、`lib/analysis/`。
  - 验收：目录结构与 `doc/detailed-design.md` 基本一致。

- [ ] FND-004 定义共享 TypeScript 类型
  - 创建 `lib/types.ts`。
  - 定义 `AssetType`、`Currency`、`PortfolioHolding`、`MarketPrice`、`PricePoint`、`ExchangeRate`、`PortfolioSnapshot`、`AnalysisResult`。
  - 验收：类型能被 `app/page.tsx` 正常 import。

- [ ] FND-005 创建 mock 投资组合快照
  - 创建可供 UI 使用的 mock `PortfolioSnapshot` 数据。
  - 放在 `lib/mockData.ts` 或等价位置。
  - 验收：首页能读取 mock 数据并显示至少一个字段。

- [ ] FND-006 配置基础 npm scripts
  - 添加 `dev`、`build`、`lint`。
  - 如果测试框架已安装，添加 `test`。
  - 验收：`npm run build` 不因项目骨架报错。

- [ ] FND-007 创建 `.gitignore`
  - 忽略 `node_modules`、`.next`、`.env`、`.env.local`、`.env.*.local`。
  - 验收：敏感环境文件不会进入 git 跟踪。

## 完成标准

- [ ] 本模块所有任务完成。
- [ ] 项目可以本地启动。
- [ ] 后续模块可以复用共享类型和目录结构。

