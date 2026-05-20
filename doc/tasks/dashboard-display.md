# 仪表盘展示模块任务

> 模块目标：用标准化 `PortfolioSnapshot` 渲染主仪表盘，包括总览、资产卡片、走势图、配置饼图、加载状态和错误状态。

## 最小任务

- [ ] UI-001 创建 Dashboard 页面状态
  - 在 `app/page.tsx` 中建立 `snapshot`、`priceStatus`、`priceError`。
  - 验收：首页能区分 loading、success、error。

- [ ] UI-002 实现价格快照首次加载
  - 页面加载时请求 `/api/prices`。
  - 成功后保存 `PortfolioSnapshot`。
  - 验收：页面能显示 API 返回数据。

- [ ] UI-003 实现 60 秒价格轮询
  - 使用 `setInterval` 定时请求 `/api/prices`。
  - 组件卸载时清理 interval。
  - 验收：不会重复创建 interval。

- [ ] UI-004 实现价格请求失败降级
  - 有旧数据时保留旧数据并显示错误提示。
  - 首次加载失败时显示空状态和重试按钮。
  - 验收：失败不会导致页面白屏。

- [ ] UI-005 实现 `PortfolioSummary`
  - 展示总资产 MYR/USD、总盈亏、总 ROI。
  - 验收：mock 快照下数字正确显示。

- [ ] UI-006 实现 `AssetCard`
  - 展示资产名称、ticker、当前价格、成本、数量、日涨跌幅、总盈亏、ROI。
  - 验收：正负盈亏状态有清晰区分。

- [ ] UI-007 实现资产卡片列表
  - 遍历 `snapshot.assets` 渲染 `AssetCard`。
  - 验收：新增持仓后列表能自动增加卡片。

- [ ] UI-008 实现 `PriceChart`
  - 使用 Recharts 展示近 30 天价格折线图。
  - 验收：有数据时显示折线，无数据时显示空状态。

- [ ] UI-009 实现 `AllocationPie`
  - 使用 Recharts 展示资产类型配置饼图。
  - 验收：股票、ETF、基金占比来自 `snapshot.allocation`。

- [ ] UI-010 实现基础响应式布局
  - Mobile 单列，Tablet 双列，Desktop 图表区域并列。
  - 验收：移动端无横向滚动。

- [ ] UI-011 编写展示组件测试
  - 测试 `PortfolioSummary`、`AssetCard`、错误状态。
  - 验收：核心渲染逻辑有测试覆盖。

## 完成标准

- [ ] 本模块所有任务完成。
- [ ] 仪表盘只依赖 `/api/prices` 返回的 `PortfolioSnapshot`。
- [ ] UI 不直接访问 `portfolio.json` 或第三方 API。

