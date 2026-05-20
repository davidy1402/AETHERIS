# Project Aetheris — 需求文档 (Proposal)

> **项目代号：** Aetheris
> **项目性质：** 个人全栈学习项目 / 求职作品集展示
> **前置项目：** Project Hosanna（纯 HTML/CSS/JS）
> **开发者技术起点：** 熟悉 HTML/CSS/JS，零 React/Vue 经验

---

## 1. 项目愿景

Aetheris 是一个**极简苹果风格的智能投资组合仪表盘**。它帮助开发者本人实时追踪股票与基金的盈亏状况，并借助 AI 模块每日生成一句话市场风险简报。

本项目的双重价值：
- **实用价值：** 真实监控个人持仓，支持 Bursa Malaysia 与美股双市场、MYR/USD 双货币。
- **学习价值：** 系统性跨越从静态网页到 React 全栈 + AI 集成 + 云部署的技术门槛。

---

## 2. 核心功能需求

### 2.1 持仓配置模块

- **数据存储方案：** 使用本地 `portfolio.json` 配置文件（而非数据库）。
  - **选择理由：** 单用户场景下，持仓数据改动频率低（仅在买入/卖出时手动更新），JSON 文件足够胜任，且无需学习配置数据库，降低入门复杂度。未来可平滑迁移至 Supabase/PostgreSQL。
- **配置内容：** 每条持仓记录包含资产代码（Ticker）、资产名称、资产类型（股票/ETF/基金）、交易所、买入均价、持有数量、计价货币（MYR 或 USD）。

**`portfolio.json` 数据结构示意：**
```json
[
  {
    "id": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "exchange": "NASDAQ",
    "currency": "USD",
    "costPrice": 178.50,
    "quantity": 10
  },
  {
    "id": "1155.KL",
    "name": "Malayan Banking Berhad",
    "type": "stock",
    "exchange": "Bursa",
    "currency": "MYR",
    "costPrice": 9.20,
    "quantity": 500
  }
]
```

### 2.2 实时市场数据模块

- **覆盖市场：**
  - 马来西亚 Bursa Malaysia（股票代码格式：`1155.KL`）
  - 美国 NYSE / NASDAQ（股票代码格式：`AAPL`, `VOO`）
- **数据来源：** Yahoo Finance 非官方 API（免费，支持两个市场，无需注册 API Key，适合学习阶段使用）。
  - ⚠️ **技术说明（学习要点）：** 非官方 API 存在不稳定风险。阶段三后期可考虑替换为 Alpha Vantage（美股，每日 25 次免费调用）或 Twelve Data（支持 Bursa，免费层每分钟 8 次）。
- **货币转换：** 对接 ExchangeRate-API（免费层，每月 1,500 次请求），实时获取 MYR/USD 汇率，统一换算显示。
- **刷新策略：** 页面打开后每 60 秒轮询一次价格更新（`setInterval`）。

### 2.3 仪表盘展示模块

仪表盘核心展示以下信息：

| 展示区域 | 内容描述 |
|---|---|
| **顶部总览卡片** | 总资产市值（MYR + USD 双显）、总盈亏金额、总盈亏百分比（ROI） |
| **资产卡片列表** | 每项持仓的：资产名称、当前价格、持仓成本、日涨跌幅、总盈亏 |
| **个人走势图** | 每项资产的历史价格折线图（近 30 天） |
| **资产配置饼图** | 股票 vs ETF/基金 各类别占总资产比例 |

**盈亏计算公式：**
```
持仓盈亏 = (当前价格 - 买入均价) × 持有数量
ROI = (持仓盈亏 / (买入均价 × 持有数量)) × 100%
```

### 2.4 AI 智能分析模块

> **这是 Aetheris 的核心产品亮点。**

- **触发方式：** 用户点击"刷新分析"按钮，或页面首次加载时自动触发一次。
- **工作流程：**
  1. Next.js 后端 API Route 读取当前持仓配置，计算各类资产占比。
  2. 调用 Claude API，传入：持仓结构摘要 + 要求 AI 联网搜索相关财经新闻。
  3. AI 输出结构化结果，包含：`brief`（一句话风险简报）+ `sentiment`（市场情绪：positive / neutral / negative）。
  4. 前端在仪表盘显著位置渲染该结果。

**AI 输出示例：**
```json
{
  "brief": "美联储鹰派立场持续压制科技股估值，建议关注马股防御性资产对冲美元风险。",
  "sentiment": "negative"
}
```

- **AI 接口选型：** Claude API（`claude-sonnet-4-20250514`），配合 `web_search` 工具实现联网新闻抓取。

### 2.5 视觉与交互模块

- **整体风格：** 极简苹果风，玻璃拟态（Glassmorphism）卡片，深色/浅色模式切换。
- **入场动画：** 图表数据线与饼图从 0 开始"生长"（使用 Framer Motion Spring 物理动画）。
- **数字滚动：** 价格更新时，数值以老虎机翻页方式丝滑变化，而非瞬间跳变。
- **互动背景：** 跟随鼠标移动的轻量粒子/渐变流光效果。
- **卡片微交互：** 鼠标悬停时资产卡片产生轻微 3D 倾斜与高光跟随效果。

---

## 3. 技术栈

| 层次 | 选型 | 说明 |
|---|---|---|
| **前端框架** | Next.js 14（App Router）+ TypeScript | 全栈框架，内置 API Routes，一个项目搞定前后端；TypeScript 对面试有加分 |
| **样式** | Tailwind CSS | 与 React 生态契合，快速实现响应式设计 |
| **动画** | Framer Motion | React 最强动画库，支持 Spring 物理、数字滚动、鼠标联动 |
| **图表** | Recharts | 基于 React 的图表库，支持自定义动画 |
| **数据存储** | `portfolio.json` 本地配置文件 | 单用户场景足够，零学习成本，专注业务逻辑 |
| **市场数据 API** | Yahoo Finance（非官方）| 免费，同时支持 Bursa Malaysia 和美股 |
| **汇率 API** | ExchangeRate-API（免费层）| 获取实时 MYR/USD 汇率 |
| **AI 接口** | Claude API | 联网新闻摘要 + 一句话风险评估 |
| **部署** | Vercel + 密码保护 | 一键部署，通过 Vercel 内置密保功能防止他人访问你的持仓数据 |
| **版本控制** | GitHub | 面试作品集展示主平台 |

---

## 4. 安全性设计

由于仪表盘包含真实个人财务数据，部署时必须启用保护：

- **Vercel 密码保护（Password Protection）：** Vercel Pro 计划内置此功能，访问网址会弹出密码框，只有你知道密码。
- **替代方案（免费）：** 在 Next.js 中添加一个简单的硬编码密码验证中间件（Middleware），无需数据库。
- **API Key 安全：** 所有 API Key（Claude API、ExchangeRate-API）必须存放在 `.env.local` 文件中，**绝对不能提交到 GitHub**。通过 Vercel 环境变量面板配置生产环境密钥。

---

## 5. 阶段性开发计划

### 阶段一：React 基础 + 静态 UI（预计 1-2 周）

**学习目标：** 理解 React 组件、Props、State、`useState`、`useEffect`。

**开发任务：**
- 搭建 Next.js 14 + TypeScript + Tailwind CSS 项目脚手架。
- 读取 `portfolio.json`，渲染静态资产卡片列表。
- 实现玻璃拟态卡片样式（`backdrop-blur`、透明边框）。
- 实现深色/浅色模式切换（`next-themes` 库）。
- 实现卡片 3D 倾斜鼠标追踪效果（纯 CSS + JS 事件监听）。

**阶段产出：** 一个有真实数据结构、但价格是静态写死的漂亮仪表盘外壳。

---

### 阶段二：API 对接 + 动效落地（预计 2-3 周）

**学习目标：** 理解 Next.js API Routes（后端路由）、`fetch`、`async/await`、Framer Motion。

**开发任务：**
- 编写 Next.js API Route（`/api/prices`），在服务端调用 Yahoo Finance API 并返回价格。
- 前端每 60 秒调用该路由，动态更新持仓盈亏。
- 对接 ExchangeRate-API，实现 MYR ↔ USD 实时换算。
- 用 Framer Motion 实现：
  - 数字老虎机滚动（`AnimatePresence` + `motion.div`）。
  - Recharts 图表入场"生长"动画。
  - 背景粒子流光效果。

**阶段产出：** 有实时价格、动态盈亏计算、丝滑动效的完整仪表盘。

---

### 阶段三：AI 模块 + 部署上线（预计 1-2 周）

**学习目标：** 理解 LLM API 调用、Prompt Engineering、环境变量管理、Vercel 部署。

**开发任务：**
- 编写 Next.js API Route（`/api/analysis`），调用 Claude API。
- 设计 Prompt：传入持仓结构，要求返回 JSON 格式的一句话简报 + 情绪标签。
- 前端渲染 AI 简报，根据情绪（positive/neutral/negative）显示不同颜色指示器。
- 将项目部署至 Vercel，配置环境变量与访问密码保护。
- 整理 GitHub README：项目简介、技术栈、功能截图、本地运行指南。

**阶段产出：** 一个可通过公网访问（密码保护）、具备 AI 分析能力的完整全栈项目。

---

## 6. 项目目录结构（规划）

```
aetheris/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 主仪表盘页面
│   ├── layout.tsx          # 全局布局（主题、字体）
│   └── api/
│       ├── prices/route.ts # 市场价格 API Route
│       └── analysis/route.ts # AI 分析 API Route
├── components/             # React 组件
│   ├── AssetCard.tsx       # 单个资产卡片
│   ├── PortfolioSummary.tsx # 总资产概览
│   ├── PriceChart.tsx      # 走势折线图
│   ├── AllocationPie.tsx   # 资产配置饼图
│   └── AIBrief.tsx         # AI 一句话简报
├── data/
│   └── portfolio.json      # 持仓配置文件（手动维护）
├── lib/
│   ├── fetchPrices.ts      # Yahoo Finance 请求封装
│   └── fetchRate.ts        # 汇率请求封装
├── .env.local              # API Keys（不提交 GitHub）
├── .gitignore
├── README.md               # 面试作品集说明
└── package.json
```

---

## 7. GitHub 展示策略（面试导向）

README 需要包含以下内容以打动面试官：

1. **项目一句话介绍** — 体现技术栈广度（React + Next.js + AI + 实时数据）。
2. **功能截图/录屏 GIF** — 展示 UI 动效、AI 简报、实时价格更新。
3. **技术亮点说明** — 解释为什么用某项技术（体现你的技术判断力）。
4. **本地运行指南** — 体现工程规范意识（`.env.example` 文件提供密钥模板）。
5. **未来计划（Roadmap）** — 体现产品思维（如：加入 Supabase、多用户支持等）。

---

## 8. 未来扩展方向（Roadmap，不在本期范围内）

- 将 `portfolio.json` 迁移至 Supabase 数据库，学习真实 ORM 操作。
- 添加简单的交易记录功能（买入/卖出历史）。
- 支持加密货币（接入 CoinGecko API）。
- 移动端 PWA 封装，支持手机桌面图标。

---

*文档版本：v1.0 | 日期：2026-05-20*