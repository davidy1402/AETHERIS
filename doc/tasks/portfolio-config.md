# 持仓配置模块任务

> 模块目标：使用本地 `data/portfolio.json` 管理单用户持仓，并提供可测试的读取与校验函数。

## 最小任务

- [ ] PTF-001 创建示例持仓文件
  - 创建 `data/portfolio.json`。
  - 包含至少一个美股资产和一个 Bursa Malaysia 资产。
  - 验收：JSON 格式合法，字段包含 `id`、`name`、`type`、`exchange`、`currency`、`costPrice`、`quantity`。

- [ ] PTF-002 实现持仓读取函数
  - 创建 `lib/portfolio/loadPortfolio.ts`。
  - 从 `data/portfolio.json` 读取并解析 JSON。
  - 验收：函数返回 `PortfolioHolding[]`。

- [ ] PTF-003 实现持仓 schema 校验
  - 创建 `lib/portfolio/validatePortfolio.ts`。
  - 校验数组结构、必填字段、枚举值、`costPrice > 0`、`quantity > 0`。
  - 验收：非法数据会抛出明确错误。

- [ ] PTF-004 定义持仓配置错误码
  - 支持 `PORTFOLIO_FILE_NOT_FOUND`、`PORTFOLIO_JSON_INVALID`、`PORTFOLIO_SCHEMA_INVALID`。
  - 验收：读取失败、JSON 失败、schema 失败能区分错误原因。

- [ ] PTF-005 接入 API Route 使用
  - 在 `/api/prices` 或临时测试 route 中调用 `loadPortfolio()`。
  - 验收：API 能拿到持仓数组。

- [ ] PTF-006 编写持仓校验测试
  - 测试合法持仓通过。
  - 测试缺字段、非法货币、非法数量、非法成本价失败。
  - 验收：测试覆盖校验规则。

## 完成标准

- [ ] 本模块所有任务完成。
- [ ] 持仓数据能独立读取、校验、测试。
- [ ] 该模块不依赖市场价格、AI 或 UI。

