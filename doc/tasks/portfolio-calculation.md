# 投资组合计算模块任务

> 模块目标：把持仓、市场价格和汇率合成为前端可直接渲染的 `PortfolioSnapshot`，并保证计算逻辑可独立测试。

## 最小任务

- [ ] CAL-001 创建计算入口函数
  - 创建 `lib/portfolio/calculatePortfolio.ts`。
  - 输入 `PortfolioHolding[]`、`MarketPrice[]`、`ExchangeRate`。
  - 输出 `PortfolioSnapshot`。
  - 验收：函数是纯函数，不访问文件系统和网络。

- [ ] CAL-002 实现单项资产成本计算
  - 计算 `costValueNative = costPrice * quantity`。
  - 验收：单个资产成本金额正确。

- [ ] CAL-003 实现单项资产市值计算
  - 计算 `marketValueNative = currentPrice * quantity`。
  - 验收：单个资产当前市值正确。

- [ ] CAL-004 实现单项资产盈亏和 ROI
  - 计算 `profitLossNative` 和 `roiPercent`。
  - 验收：符合需求文档公式。

- [ ] CAL-005 实现 MYR/USD 双币种换算
  - USD 资产换算 MYR。
  - MYR 资产换算 USD。
  - 验收：双币种字段在 `PortfolioAssetSnapshot` 中正确返回。

- [ ] CAL-006 实现总览统计
  - 计算总资产 MYR/USD、总盈亏 MYR/USD、总 ROI。
  - 总 ROI 使用统一 MYR 成本口径。
  - 验收：多资产组合的总览数值正确。

- [ ] CAL-007 实现资产配置统计
  - 按 `stock`、`etf`、`fund` 分组。
  - 使用 MYR 市值计算占比。
  - 验收：占比合计约等于 100%。

- [ ] CAL-008 将计算模块接入 `/api/prices`
  - `/api/prices` 返回完整 `PortfolioSnapshot`。
  - 验收：前端不需要再自行计算盈亏。

- [ ] CAL-009 编写计算测试
  - 测试单资产 USD。
  - 测试单资产 MYR。
  - 测试多资产总览。
  - 测试配置比例。
  - 验收：核心计算有自动化测试覆盖。

## 完成标准

- [ ] 本模块所有任务完成。
- [ ] 投资组合计算不依赖 React、API Route 或外部网络。
- [ ] `/api/prices` 能返回完整快照。

