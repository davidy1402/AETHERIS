# AI 智能分析模块任务

> 模块目标：基于当前持仓结构生成 Gemini 风险简报，并在前端展示 `brief` 和 `sentiment`。

## 最小任务

- [x] AI-001 创建 AI 分析 prompt 构造函数
  - 创建 `lib/analysis/buildAnalysisPrompt.ts`。
  - 输入持仓结构和资产配置摘要。
  - 输出要求 JSON 格式的中文简报 prompt。
  - 验收：prompt 明确要求 `brief` 和 `sentiment`。

- [x] AI-002 创建 AI 输出解析函数
  - 创建 `lib/analysis/parseAnalysisResult.ts`。
  - 解析 JSON，校验 `brief` 和 `sentiment`。
  - 验收：非法 JSON 或非法情绪值会失败。

- [x] AI-003 实现 Gemini API 调用 (已根据用户需求从 Claude API 切换为 Gemini API)
  - 使用 `GEMINI_API_KEY`。
  - 选用高阶模型 `gemini-2.5-pro`（自动降级至 `gemini-1.5-pro`）。
  - 配合谷歌搜索（googleSearch grounding）工具获取最新财经新闻。
  - 验收：服务端能拿到模型文本输出。

- [x] AI-004 实现 `/api/analysis`
  - 创建 `app/api/analysis/route.ts`。
  - 使用 `POST` 触发一次分析。
  - 返回 `AnalysisResult`。
  - 验收：`POST /api/analysis` 返回 `brief`、`sentiment`、`generatedAt`。

- [x] AI-005 增加 AI 错误处理
  - 缺少 API Key 时返回明确错误。
  - Gemini 调用失败时返回统一错误结构。
  - 模型输出解析失败时返回 `ANALYSIS_RESULT_INVALID`。
  - 验收：AI 失败不影响 `/api/prices`。

- [x] AI-006 实现 `AIBrief` (AiAnalysis.tsx) 组件
  - 展示一句话简报。
  - 根据 `positive`、`neutral`、`negative` 显示不同状态。
  - 验收：三种情绪状态都能渲染。

- [x] AI-007 接入页面首次自动分析
  - Dashboard 首次加载后请求 `/api/analysis`。
  - 验收：页面初次打开会出现 AI 简报或错误状态。

- [x] AI-008 实现「刷新分析」按钮
  - 点击按钮重新请求 `/api/analysis`。
  - loading 时禁用按钮或显示加载状态。
  - 验收：用户可手动刷新 AI 简报。

- [x] AI-009 编写 AI 模块测试
  - 测试 prompt 构造。
  - 测试合法和非法 AI 输出解析。
  - 验收：AI 核心逻辑可独立测试。

## 完成标准

- [x] 本模块所有任务完成。
- [x] AI 模块只通过 `/api/analysis` 暴露给前端。
- [x] Gemini API Key 不会暴露到浏览器。
