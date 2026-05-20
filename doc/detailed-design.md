# Project Aetheris — 详细设计文档

> 文档版本：v1.0  
> 日期：2026-05-20  
> 输入需求文档：`proposal.md`  
> 项目性质：个人全栈学习项目 / 求职作品集展示

---

## 1. 设计目标

Aetheris 是一个基于 Next.js 14、TypeScript、Tailwind CSS、Framer Motion、Recharts 与 AI API 的单用户智能投资组合仪表盘。系统以本地 `portfolio.json` 为持仓数据源，服务端 API Route 负责读取持仓、拉取市场价格、汇率与 AI 分析结果，前端负责组合展示资产总览、资产卡片、历史走势、配置饼图与 AI 风险简报。

详细设计的核心目标：

1. 按需求文档拆分独立模块，降低模块之间的耦合。
2. 前端展示模块只依赖统一后的领域数据，不直接依赖第三方 API 返回结构。
3. 服务端 API Route 隔离外部 API 调用、密钥与数据转换逻辑。
4. 每个模块可以通过 mock 数据或单元函数独立测试。
5. 未在需求中明确且会影响实现选择的内容，在本文中标记为「待确认」。

---

## 2. 总体架构

### 2.1 架构分层

```text
Browser UI
  ├─ Dashboard Page
  ├─ PortfolioSummary
  ├─ AssetCard
  ├─ PriceChart
  ├─ AllocationPie
  └─ AIBrief

Next.js App Router
  ├─ app/page.tsx
  ├─ app/layout.tsx
  └─ app/api
      ├─ prices/route.ts
      └─ analysis/route.ts

Domain / Service Layer
  ├─ portfolio loader
  ├─ price service
  ├─ exchange-rate service
  ├─ analysis service
  └─ portfolio calculation utilities

Local / External Data
  ├─ data/portfolio.json
  ├─ Yahoo Finance unofficial endpoint
  ├─ ExchangeRate-API
  └─ Claude API with web search
```

### 2.2 数据流

1. 页面加载时，前端请求 `/api/prices`。
2. `/api/prices` 读取 `data/portfolio.json`。
3. 服务端根据 ticker 批量请求 Yahoo Finance 当前价格与近 30 天历史价格。
4. 服务端请求 ExchangeRate-API 获取 MYR/USD 汇率。
5. 服务端将持仓、价格、汇率转换成统一的 `PortfolioSnapshot` 返回前端。
6. 前端渲染总览、资产卡片、折线图与饼图。
7. 页面首次加载或用户点击「刷新分析」时，请求 `/api/analysis`。
8. `/api/analysis` 读取当前持仓结构，计算资产占比，调用 Claude API 返回风险简报。
9. 前端根据 `sentiment` 渲染 AI 简报和情绪指示器。
10. 前端每 60 秒重新请求 `/api/prices`，更新价格与盈亏。

### 2.3 模块独立性原则

| 模块 | 独立边界 | 可独立测试方式 |
|---|---|---|
| 持仓配置模块 | 只负责读取与校验本地 JSON | 使用样例 JSON 测试 schema 校验 |
| 市场数据模块 | 只负责外部价格和汇率获取 | mock fetch 返回第三方响应 |
| 投资组合计算模块 | 只负责纯计算 | 输入持仓、价格、汇率，断言市值和 ROI |
| 仪表盘展示模块 | 只依赖标准化快照数据 | 使用 mock `PortfolioSnapshot` 渲染组件 |
| AI 分析模块 | 只负责摘要构造和 LLM 调用 | mock Claude API，断言 prompt 和解析 |
| 视觉交互模块 | 只负责 UI 状态和动画 | 组件测试、视觉检查、手动交互测试 |
| 安全模块 | 只负责访问保护和密钥隔离 | middleware 测试、环境变量缺失测试 |

---

## 3. 目录设计

```text
aetheris/
├── app/
│   ├── api/
│   │   ├── analysis/
│   │   │   └── route.ts
│   │   └── prices/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AIBrief.tsx
│   ├── AllocationPie.tsx
│   ├── AssetCard.tsx
│   ├── BackgroundEffect.tsx
│   ├── NumberTicker.tsx
│   ├── PortfolioSummary.tsx
│   ├── PriceChart.tsx
│   └── ThemeToggle.tsx
├── data/
│   └── portfolio.json
├── lib/
│   ├── analysis/
│   │   ├── buildAnalysisPrompt.ts
│   │   └── parseAnalysisResult.ts
│   ├── market/
│   │   ├── fetchPrices.ts
│   │   ├── fetchRate.ts
│   │   └── yahooFinanceMapper.ts
│   ├── portfolio/
│   │   ├── calculatePortfolio.ts
│   │   ├── loadPortfolio.ts
│   │   └── validatePortfolio.ts
│   └── types.ts
├── middleware.ts
├── .env.example
├── .env.local
├── .gitignore
├── README.md
└── package.json
```

说明：

- `components/` 只放 UI 组件，不直接访问文件系统或第三方 API。
- `lib/market/` 隔离 Yahoo Finance 和 ExchangeRate-API 的返回结构。
- `lib/portfolio/` 放纯业务计算，便于单元测试。
- `lib/analysis/` 隔离 prompt 构造、Claude 调用结果解析与错误处理。
- `app/api/*/route.ts` 只做请求入口、状态码处理和调用服务函数。

---

## 4. 核心类型设计

### 4.1 持仓配置类型

```ts
export type AssetType = "stock" | "etf" | "fund";
export type Currency = "MYR" | "USD";

export interface PortfolioHolding {
  id: string;
  name: string;
  type: AssetType;
  exchange: string;
  currency: Currency;
  costPrice: number;
  quantity: number;
}
```

校验规则：

| 字段 | 规则 |
|---|---|
| `id` | 非空字符串，用作 ticker 和前端 key |
| `name` | 非空字符串 |
| `type` | 只能是 `stock`、`etf`、`fund` |
| `exchange` | 非空字符串 |
| `currency` | 只能是 `MYR` 或 `USD` |
| `costPrice` | 大于 0 |
| `quantity` | 大于 0 |

### 4.2 市场价格类型

```ts
export interface MarketPrice {
  id: string;
  currency: Currency;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  history30d: PricePoint[];
  updatedAt: string;
}

export interface PricePoint {
  date: string;
  close: number;
}
```

### 4.3 汇率类型

```ts
export interface ExchangeRate {
  base: "USD";
  target: "MYR";
  usdToMyr: number;
  myrToUsd: number;
  updatedAt: string;
}
```

### 4.4 前端快照类型

```ts
export interface PortfolioAssetSnapshot {
  id: string;
  name: string;
  type: AssetType;
  exchange: string;
  currency: Currency;
  costPrice: number;
  quantity: number;
  currentPrice: number;
  marketValueNative: number;
  marketValueMYR: number;
  marketValueUSD: number;
  costValueNative: number;
  profitLossNative: number;
  profitLossMYR: number;
  roiPercent: number;
  dayChangePercent: number;
  history30d: PricePoint[];
}

export interface PortfolioSnapshot {
  assets: PortfolioAssetSnapshot[];
  totals: {
    marketValueMYR: number;
    marketValueUSD: number;
    profitLossMYR: number;
    profitLossUSD: number;
    roiPercent: number;
  };
  allocation: {
    type: AssetType;
    marketValueMYR: number;
    percentage: number;
  }[];
  exchangeRate: ExchangeRate;
  updatedAt: string;
}
```

### 4.5 AI 分析类型

```ts
export type MarketSentiment = "positive" | "neutral" | "negative";

export interface AnalysisResult {
  brief: string;
  sentiment: MarketSentiment;
  generatedAt: string;
}
```

---

## 5. 持仓配置模块详细设计

### 5.1 模块职责

持仓配置模块负责读取、解析和校验 `data/portfolio.json`。它不负责获取市场价格，不负责计算盈亏，也不负责前端展示。

### 5.2 主要文件

| 文件 | 职责 |
|---|---|
| `data/portfolio.json` | 手动维护的持仓配置 |
| `lib/portfolio/loadPortfolio.ts` | 从本地文件读取 JSON |
| `lib/portfolio/validatePortfolio.ts` | 校验字段类型和业务合法性 |

### 5.3 设计流程

1. `loadPortfolio()` 使用 Node.js 文件系统 API 读取 `data/portfolio.json`。
2. JSON 解析失败时抛出配置错误。
3. `validatePortfolio()` 检查数组结构、必填字段、枚举值、数值范围。
4. 校验通过后返回 `PortfolioHolding[]`。

### 5.4 错误处理

| 场景 | 处理 |
|---|---|
| 文件不存在 | API 返回 500，错误码 `PORTFOLIO_FILE_NOT_FOUND` |
| JSON 格式错误 | API 返回 500，错误码 `PORTFOLIO_JSON_INVALID` |
| 字段缺失或非法 | API 返回 500，错误码 `PORTFOLIO_SCHEMA_INVALID` |

### 5.5 测试点

- 正确读取合法 `portfolio.json`。
- 缺少 `id` 时返回校验错误。
- `currency` 不是 `MYR` 或 `USD` 时返回校验错误。
- `costPrice <= 0` 或 `quantity <= 0` 时返回校验错误。

---

## 6. 实时市场数据模块详细设计

### 6.1 模块职责

实时市场数据模块负责从外部服务获取当前价格、日涨跌幅、近 30 天历史价格和汇率。该模块不负责持仓盈亏计算，也不直接返回给前端展示结构。

### 6.2 主要文件

| 文件 | 职责 |
|---|---|
| `lib/market/fetchPrices.ts` | 请求 Yahoo Finance 当前价格和历史价格 |
| `lib/market/yahooFinanceMapper.ts` | 将第三方响应转换为 `MarketPrice` |
| `lib/market/fetchRate.ts` | 请求 ExchangeRate-API 并转换汇率 |
| `app/api/prices/route.ts` | 对外提供价格快照 API |

### 6.3 Yahoo Finance 请求设计

需求文档指定使用 Yahoo Finance 非官方 API。具体实现可采用两类方式：

1. 直接请求 Yahoo Finance chart/quote 相关非官方 endpoint。
2. 使用封装库，例如 `yahoo-finance2`。

建议优先选择封装库以降低学习成本，但需要在 README 中说明非官方 API 的稳定性风险。

待确认：

- 是否允许引入 `yahoo-finance2` npm 包；如果不允许，则使用原生 `fetch` 调用非官方 endpoint。

### 6.4 汇率请求设计

ExchangeRate-API 用于获取 USD 到 MYR 汇率。

环境变量：

```text
EXCHANGE_RATE_API_KEY=...
```

返回后统一生成：

```ts
usdToMyr = response.conversion_rates.MYR;
myrToUsd = 1 / usdToMyr;
```

### 6.5 `/api/prices` 接口设计

请求：

```http
GET /api/prices
```

成功响应：

```json
{
  "assets": [],
  "totals": {
    "marketValueMYR": 0,
    "marketValueUSD": 0,
    "profitLossMYR": 0,
    "profitLossUSD": 0,
    "roiPercent": 0
  },
  "allocation": [],
  "exchangeRate": {
    "base": "USD",
    "target": "MYR",
    "usdToMyr": 4.7,
    "myrToUsd": 0.2127,
    "updatedAt": "2026-05-20T00:00:00.000Z"
  },
  "updatedAt": "2026-05-20T00:00:00.000Z"
}
```

失败响应：

```json
{
  "error": {
    "code": "MARKET_DATA_UNAVAILABLE",
    "message": "Unable to fetch latest market data."
  }
}
```

### 6.6 刷新策略

前端使用 `setInterval` 每 60 秒请求一次 `/api/prices`。

设计要求：

- 页面卸载时清理 interval。
- 请求进行中时避免重复请求。
- 请求失败时保留上一次成功数据，并在 UI 上显示更新时间和错误状态。
- 首次加载无数据且失败时显示错误空状态。

### 6.7 错误处理

| 场景 | 处理 |
|---|---|
| 单个 ticker 获取失败 | 该资产标记为错误，其他资产继续返回 |
| 汇率获取失败 | 返回 502，前端保留旧数据 |
| 第三方 API 超时 | 返回 504 |
| 第三方 API 结构变化 | 返回 502，记录 mapper 错误 |

### 6.8 测试点

- Bursa ticker `1155.KL` 能被传入价格服务。
- 美股 ticker `AAPL` 能被传入价格服务。
- USD 资产能换算为 MYR。
- MYR 资产能换算为 USD。
- 部分资产价格失败时不会导致整个列表丢失，除非实现阶段决定全部失败。

待确认：

- 是否需要在服务端添加短期缓存来减少第三方 API 调用。本期需求只要求 60 秒轮询，没有明确缓存要求。

---

## 7. 投资组合计算模块详细设计

### 7.1 模块职责

投资组合计算模块负责将持仓配置、市场价格和汇率合成为前端可展示的 `PortfolioSnapshot`。该模块必须是纯函数，便于单元测试。

### 7.2 主要文件

| 文件 | 职责 |
|---|---|
| `lib/portfolio/calculatePortfolio.ts` | 计算市值、成本、盈亏、ROI 和资产配置 |
| `lib/types.ts` | 共享类型定义 |

### 7.3 单项资产计算

```text
成本金额 = 买入均价 × 持有数量
当前市值 = 当前价格 × 持有数量
持仓盈亏 = 当前市值 - 成本金额
ROI = 持仓盈亏 / 成本金额 × 100%
```

货币换算：

```text
USD 资产市值 MYR = USD 市值 × usdToMyr
MYR 资产市值 USD = MYR 市值 × myrToUsd
```

### 7.4 总览计算

```text
总资产市值 MYR = 所有资产 MYR 市值求和
总资产市值 USD = 所有资产 USD 市值求和
总盈亏 MYR = 所有资产 MYR 盈亏求和
总盈亏 USD = 所有资产 USD 盈亏求和
总 ROI = 总盈亏 MYR / 总成本 MYR × 100%
```

说明：总 ROI 使用统一后的 MYR 作为基准，避免双货币资产混算。

### 7.5 资产配置计算

按 `AssetType` 分组，使用 MYR 市值计算比例：

```text
类别占比 = 当前类别 MYR 市值 / 总资产 MYR 市值 × 100%
```

### 7.6 测试点

- 单个 USD 资产的 MYR 市值换算正确。
- 单个 MYR 资产的 USD 市值换算正确。
- 多资产总市值、总盈亏、总 ROI 正确。
- 股票、ETF、基金配置比例合计约等于 100%。
- 空数组输入时返回空资产和 0 总览，或抛出配置错误。

待确认：

- 当 `portfolio.json` 为空数组时，是显示空仪表盘还是视为配置错误。

---

## 8. 仪表盘展示模块详细设计

### 8.1 模块职责

仪表盘展示模块负责前端页面布局、状态管理和用户交互。它不直接读取本地 JSON，不直接调用 Yahoo Finance、ExchangeRate-API 或 Claude API。

### 8.2 页面组成

| 组件 | 职责 |
|---|---|
| `app/page.tsx` | 页面容器，负责数据请求和状态组合 |
| `PortfolioSummary` | 展示总资产市值、总盈亏、总 ROI |
| `AssetCard` | 展示单个持仓当前价格、成本、日涨跌幅、总盈亏 |
| `PriceChart` | 展示近 30 天历史价格折线图 |
| `AllocationPie` | 展示股票、ETF、基金配置饼图 |
| `AIBrief` | 展示 AI 风险简报和情绪 |
| `ThemeToggle` | 深色/浅色模式切换 |
| `BackgroundEffect` | 鼠标跟随粒子/渐变背景 |
| `NumberTicker` | 数字滚动效果 |

### 8.3 页面状态

```ts
interface DashboardState {
  snapshot: PortfolioSnapshot | null;
  analysis: AnalysisResult | null;
  priceStatus: "idle" | "loading" | "success" | "error";
  analysisStatus: "idle" | "loading" | "success" | "error";
  priceError?: string;
  analysisError?: string;
}
```

### 8.4 首次加载流程

1. 初始化 `priceStatus = "loading"`。
2. 请求 `/api/prices`。
3. 成功后设置 `snapshot`，渲染仪表盘。
4. 同时或随后请求 `/api/analysis`。
5. 设置 60 秒价格轮询。

### 8.5 资产卡片展示规则

每个 `AssetCard` 显示：

- 资产名称和 ticker。
- 当前价格和原始货币。
- 成本价和持仓数量。
- 日涨跌幅。
- 总盈亏金额。
- ROI。

颜色规则：

| 状态 | 颜色语义 |
|---|---|
| 盈亏 > 0 | 正向色 |
| 盈亏 < 0 | 风险色 |
| 盈亏 = 0 | 中性色 |

具体颜色值在实现阶段根据 Tailwind 主题定义。

### 8.6 图表展示规则

`PriceChart`：

- 输入为资产的 `history30d`。
- 默认展示所有资产，或按用户选中资产展示。
- x 轴为日期，y 轴为收盘价。

待确认：

- 个人走势图是展示所有资产多条线，还是点击某张资产卡片后展示单个资产走势。需求中写「每项资产的历史价格折线图」，两种实现都符合字面含义。

`AllocationPie`：

- 输入为 `allocation`。
- 使用 MYR 统一市值计算。
- 展示股票、ETF、基金占比。

### 8.7 测试点

- 给定 mock `PortfolioSnapshot`，总览数字正确渲染。
- 价格请求失败时显示错误状态并保留旧数据。
- 60 秒 interval 能创建并在卸载时清理。
- 主题切换后页面样式切换。
- AI 分析 loading、success、error 状态显示正确。

---

## 9. AI 智能分析模块详细设计

### 9.1 模块职责

AI 智能分析模块负责将当前持仓结构转换为摘要 prompt，调用 Claude API，并将模型输出解析为结构化 `AnalysisResult`。该模块不负责渲染 UI，不负责市场价格获取。

### 9.2 主要文件

| 文件 | 职责 |
|---|---|
| `app/api/analysis/route.ts` | 对外提供 AI 分析 API |
| `lib/analysis/buildAnalysisPrompt.ts` | 构造 prompt |
| `lib/analysis/parseAnalysisResult.ts` | 解析和校验 AI 输出 |

### 9.3 环境变量

```text
ANTHROPIC_API_KEY=...
```

### 9.4 `/api/analysis` 接口设计

请求：

```http
POST /api/analysis
```

说明：虽然需求中未明确 GET 或 POST，但 AI 分析会触发外部模型调用，建议使用 `POST` 表达「生成一次分析」的动作。

成功响应：

```json
{
  "brief": "美联储鹰派立场持续压制科技股估值，建议关注马股防御性资产对冲美元风险。",
  "sentiment": "negative",
  "generatedAt": "2026-05-20T00:00:00.000Z"
}
```

失败响应：

```json
{
  "error": {
    "code": "ANALYSIS_UNAVAILABLE",
    "message": "Unable to generate market analysis."
  }
}
```

### 9.5 Prompt 设计

输入摘要包含：

- 持仓 ticker 列表。
- 资产类型和交易所。
- 统一 MYR 口径的资产配置比例。
- USD 与 MYR 暴露比例。
- 输出格式约束。

Prompt 输出要求：

```json
{
  "brief": "一句中文市场风险简报，不超过 60 个汉字",
  "sentiment": "positive | neutral | negative"
}
```

约束：

- 必须返回 JSON。
- 不返回 Markdown。
- 不返回投资建议承诺。
- 语气为风险提示，不保证收益。

### 9.6 解析与降级

`parseAnalysisResult()` 负责：

1. 提取模型文本。
2. 解析 JSON。
3. 校验 `brief` 为非空字符串。
4. 校验 `sentiment` 属于 `positive | neutral | negative`。
5. 解析失败时抛出 `ANALYSIS_RESULT_INVALID`。

如果 Claude API 调用失败：

- 前端保留上一次分析结果。
- 显示「分析暂不可用」状态。
- 不影响价格与仪表盘主流程。

### 9.7 测试点

- prompt 包含持仓摘要和输出格式要求。
- 合法 AI JSON 能被解析。
- 非 JSON 输出会被识别为错误。
- 非法 `sentiment` 会被识别为错误。
- API Key 缺失时返回明确错误。

待确认：

- 是否需要展示 AI 新闻来源链接。需求只要求一句话简报和情绪，未要求来源展示。

---

## 10. 视觉与交互模块详细设计

### 10.1 设计原则

视觉方向为极简苹果风、玻璃拟态、深浅模式切换、柔和动效。界面应优先服务投资组合扫描和信息判断，避免装饰性元素干扰关键数字。

### 10.2 样式系统

技术选型：

- Tailwind CSS 负责布局、颜色、间距、响应式。
- `next-themes` 负责深浅模式。
- Framer Motion 负责入场动画、数字滚动、微交互。
- Recharts 负责折线图和饼图。

### 10.3 组件交互

| 交互 | 实现方式 |
|---|---|
| 深色/浅色切换 | `next-themes` 切换 class |
| 资产卡片 3D 倾斜 | 鼠标位置计算 rotateX / rotateY |
| 高光跟随 | CSS radial-gradient 根据鼠标位置更新 |
| 数字滚动 | `AnimatePresence` + `motion.div` |
| 图表生长 | Recharts animation + Framer Motion 容器入场 |
| 背景流光 | 轻量 CSS gradient 或 canvas 粒子 |

### 10.4 响应式布局

| 断点 | 布局 |
|---|---|
| Mobile | 单列，总览、AI、资产卡片、图表依次排列 |
| Tablet | 两列卡片，图表独占宽度 |
| Desktop | 总览顶部，资产卡片网格，图表和饼图并列 |

### 10.5 可访问性要求

- 所有按钮必须有可读文本或 `aria-label`。
- 盈亏颜色不能作为唯一信息来源，同时显示正负号和百分比。
- 动画不应阻塞内容阅读。
- 数字更新时避免布局跳动。

### 10.6 测试点

- 深浅模式下文字对比度可读。
- 移动端布局无横向滚动。
- 数字变化不会撑破卡片。
- 图表在无数据时显示空状态。
- 悬停和背景动效不影响主内容点击。

---

## 11. 安全性模块详细设计

### 11.1 模块职责

安全性模块负责访问保护、环境变量隔离和敏感文件防提交。

### 11.2 访问保护

生产环境优先方案：

- 使用 Vercel Password Protection。

免费替代方案：

- 使用 Next.js `middleware.ts` 实现简单密码保护。

待确认：

- 最终部署是否使用 Vercel Pro 密码保护。如果不使用，则需要实现 middleware 密码保护。

### 11.3 API Key 管理

`.env.local`：

```text
ANTHROPIC_API_KEY=...
EXCHANGE_RATE_API_KEY=...
APP_PASSWORD=...
```

`.env.example`：

```text
ANTHROPIC_API_KEY=
EXCHANGE_RATE_API_KEY=
APP_PASSWORD=
```

`.gitignore` 必须包含：

```text
.env
.env.local
.env.*.local
```

### 11.4 敏感数据边界

- `portfolio.json` 包含真实持仓数据，应视为敏感文件。
- 如果项目用于公开 GitHub 展示，建议提交脱敏示例数据，并将真实持仓文件加入 `.gitignore`。

待确认：

- GitHub 仓库是否公开。如果公开，真实 `portfolio.json` 不应提交。

### 11.5 测试点

- `.env.local` 不会被 Git 跟踪。
- API Route 不会把 API Key 返回给前端。
- 未授权访问生产页面时会被密码保护拦截。

---

## 12. API Route 设计

### 12.1 `/api/prices`

| 项目 | 设计 |
|---|---|
| 方法 | `GET` |
| 用途 | 获取最新投资组合价格快照 |
| 读取 | `data/portfolio.json`、ExchangeRate-API、Yahoo Finance |
| 返回 | `PortfolioSnapshot` |
| 前端调用时机 | 页面首次加载、每 60 秒轮询 |

状态码：

| 状态码 | 场景 |
|---|---|
| 200 | 成功 |
| 500 | 本地配置错误 |
| 502 | 外部 API 返回异常 |
| 504 | 外部 API 超时 |

### 12.2 `/api/analysis`

| 项目 | 设计 |
|---|---|
| 方法 | `POST` |
| 用途 | 生成 AI 市场风险简报 |
| 读取 | `data/portfolio.json`、Claude API |
| 返回 | `AnalysisResult` |
| 前端调用时机 | 页面首次加载、用户点击刷新分析 |

状态码：

| 状态码 | 场景 |
|---|---|
| 200 | 成功 |
| 500 | 本地配置错误或 API Key 缺失 |
| 502 | Claude API 返回异常 |
| 504 | Claude API 超时 |

---

## 13. 错误处理与用户反馈

### 13.1 前端错误状态

| 模块 | 错误表现 |
|---|---|
| 价格数据 | 顶部显示数据更新失败，保留旧数据 |
| 首次价格加载 | 显示错误空状态和重试按钮 |
| AI 分析 | AI 卡片显示分析暂不可用 |
| 图表数据 | 图表区域显示暂无历史数据 |
| 汇率数据 | 不渲染错误换算结果，提示汇率不可用 |

### 13.2 服务端错误格式

统一错误结构：

```ts
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

### 13.3 日志策略

- 服务端日志记录外部 API 错误和配置错误。
- 前端只显示用户可理解的简短错误。
- 不在前端暴露 API Key、完整第三方响应或堆栈信息。

---

## 14. 测试设计

### 14.1 单元测试

建议使用 Vitest。

| 测试对象 | 重点 |
|---|---|
| `validatePortfolio` | schema、枚举、数值范围 |
| `calculatePortfolio` | 盈亏、ROI、汇率换算、配置比例 |
| `yahooFinanceMapper` | 第三方响应到内部类型的转换 |
| `parseAnalysisResult` | JSON 解析和情绪枚举校验 |

### 14.2 组件测试

建议使用 React Testing Library。

| 组件 | 重点 |
|---|---|
| `PortfolioSummary` | 总市值、总盈亏、ROI 渲染 |
| `AssetCard` | 正负盈亏状态、价格格式 |
| `AIBrief` | 三种情绪状态和 loading/error |
| `AllocationPie` | 空数据和正常数据 |

### 14.3 集成测试

| 场景 | 重点 |
|---|---|
| `/api/prices` | mock 外部 API 后返回完整快照 |
| `/api/analysis` | mock Claude API 后返回结构化结果 |
| Dashboard 首次加载 | 能展示价格和 AI 分析 |
| 价格轮询 | 能定时刷新并清理 interval |

### 14.4 手动验收

- 修改 `portfolio.json` 后页面能显示新的资产。
- 断开 ExchangeRate-API Key 后错误提示合理。
- 断开 Claude API Key 后 AI 模块错误不影响主仪表盘。
- 移动端和桌面端布局正常。
- 深浅模式切换正常。

---

## 15. 阶段实施设计

### 15.1 阶段一：React 基础 + 静态 UI

目标：

- 搭建 Next.js 14 + TypeScript + Tailwind CSS。
- 建立类型定义和 `portfolio.json`。
- 使用静态 mock 价格渲染仪表盘。

交付：

- `PortfolioSummary`
- `AssetCard`
- `ThemeToggle`
- 基础玻璃拟态布局
- 静态 mock 的 `PortfolioSnapshot`

测试：

- 组件能使用 mock 数据独立渲染。
- 深浅模式可切换。

### 15.2 阶段二：API 对接 + 动效落地

目标：

- 实现 `/api/prices`。
- 对接 Yahoo Finance 和 ExchangeRate-API。
- 实现 60 秒刷新。
- 加入图表和核心动画。

交付：

- `fetchPrices`
- `fetchRate`
- `calculatePortfolio`
- `PriceChart`
- `AllocationPie`
- `NumberTicker`
- `BackgroundEffect`

测试：

- mock 外部 API 后 `/api/prices` 返回正确快照。
- 轮询失败时保留旧数据。

### 15.3 阶段三：AI 模块 + 部署上线

目标：

- 实现 `/api/analysis`。
- 调用 Claude API 生成结构化风险简报。
- 完成 Vercel 部署和访问保护。
- 完成 README 展示材料。

交付：

- `buildAnalysisPrompt`
- `parseAnalysisResult`
- `AIBrief`
- `.env.example`
- README 本地运行指南

测试：

- mock Claude API 后分析模块可用。
- API Key 缺失时错误明确。
- 生产访问保护生效。

---

## 16. 待确认事项汇总

以下事项不阻塞详细设计，但会影响后续实现选择：

1. 是否允许引入 `yahoo-finance2` npm 包，还是必须使用原生 `fetch` 调用 Yahoo Finance 非官方 endpoint。
2. `/api/prices` 是否需要服务端短期缓存，降低第三方 API 调用频率。
3. `portfolio.json` 为空数组时，是显示空仪表盘还是视为配置错误。
4. 个人走势图是默认展示所有资产多条线，还是点击资产后展示单个资产走势。
5. AI 简报是否需要展示新闻来源链接。
6. 最终部署是否使用 Vercel Pro Password Protection；如果不使用，是否实现 Next.js middleware 密码保护。
7. GitHub 仓库是否公开；如果公开，真实 `portfolio.json` 应加入 `.gitignore`，仓库只提交示例持仓。

---

## 17. 验收标准

项目完成时应满足：

1. 页面能读取本地持仓配置并展示所有资产。
2. 页面能显示 MYR 和 USD 双币种总资产。
3. 每个资产能显示当前价格、成本、日涨跌幅、总盈亏和 ROI。
4. 页面能显示近 30 天价格走势图。
5. 页面能显示股票、ETF、基金配置饼图。
6. 页面首次加载能自动生成 AI 风险简报。
7. 用户点击按钮能刷新 AI 风险简报。
8. 价格每 60 秒自动刷新。
9. 第三方 API 失败时，页面有明确错误状态，不暴露敏感信息。
10. API Key 不提交到 GitHub。
11. 生产环境有访问保护。
12. 各核心计算函数和解析函数可以独立测试。

