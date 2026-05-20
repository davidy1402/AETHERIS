# 实时市场数据模块任务

> 模块目标：服务端获取 Yahoo Finance 市场价格、近 30 天历史价格和 ExchangeRate-API 汇率，并转换为内部统一类型。

## 最小任务

- [x] MKT-001 确认 Yahoo Finance 调用方式
  - 在 `doc/detailed-design.md` 待确认事项中选择：`yahoo-finance2` 或原生 `fetch`。
  - 验收：README 或代码注释中明确非官方 API 风险。

- [x] MKT-002 实现 Yahoo Finance 当前价格请求
  - 创建 `lib/market/fetchPrices.ts`。
  - 输入 ticker 列表，输出每个 ticker 的当前价格、货币、日涨跌。
  - 验收：能请求 `AAPL` 和 `1155.KL`。

- [x] MKT-003 实现近 30 天历史价格请求
  - 为每个 ticker 返回 `history30d: PricePoint[]`。
  - 验收：每个资产至少能得到日期和收盘价字段。

- [x] MKT-004 实现 Yahoo 响应 mapper
  - 创建 `lib/market/yahooFinanceMapper.ts`。
  - 把第三方响应转换为 `MarketPrice`。
  - 验收：UI 和计算模块不直接依赖 Yahoo 原始字段。

- [x] MKT-005 实现汇率请求
  - 创建 `lib/market/fetchRate.ts`。
  - 使用 `EXCHANGE_RATE_API_KEY` 获取 USD/MYR。
  - 返回 `usdToMyr` 和 `myrToUsd`。
  - 验收：缺少 API Key 时返回明确错误。

- [x] MKT-006 实现 `/api/prices` 基础响应
  - 创建 `app/api/prices/route.ts`。
  - 读取持仓、请求价格、请求汇率。
  - 暂时可以返回持仓、价格和汇率的原始组合结果。
  - 验收：`GET /api/prices` 返回 JSON。

- [x] MKT-007 增加市场数据错误处理
  - 处理第三方 API 失败、超时、响应结构异常。
  - 使用 502 或 504 状态码。
  - 验收：外部服务失败时前端可收到统一错误结构。

- [x] MKT-008 编写市场数据测试
  - mock Yahoo Finance 响应。
  - mock ExchangeRate-API 响应。
  - 验收：mapper 和汇率转换逻辑可独立测试。

## 完成标准

- [x] 本模块所有任务完成。
- [x] `AAPL` 和 `1155.KL` 能获取价格。
- [x] 汇率能转换为内部 `ExchangeRate`。
- [x] 第三方响应结构被隔离在 `lib/market/`。
