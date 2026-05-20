import { describe, it, expect } from "vitest";
import { parseAnalysisResult } from "./parseAnalysisResult";

describe("parseAnalysisResult", () => {
  it("should parse valid JSON response", () => {
    const raw = `{"brief": "美股回暖带动组合整体上扬，但需留意马币走弱对美元计价资产的侵蚀。", "sentiment": "neutral"}`;
    const result = parseAnalysisResult(raw);
    expect(result.brief).toBe("美股回暖带动组合整体上扬，但需留意马币走弱对美元计价资产的侵蚀。");
    expect(result.sentiment).toBe("neutral");
  });

  it("should strip markdown code blocks and parse successfully", () => {
    const raw = `\`\`\`json
    {
      "brief": "科技股回调压力显现，重仓半导体带来下行风险。",
      "sentiment": "negative"
    }
    \`\`\``;
    const result = parseAnalysisResult(raw);
    expect(result.brief).toBe("科技股回调压力显现，重仓半导体带来下行风险。");
    expect(result.sentiment).toBe("negative");
  });

  it("should throw on missing keys", () => {
    const raw = `{"sentiment": "positive"}`;
    expect(() => parseAnalysisResult(raw)).toThrowError(/missing a valid 'brief'/);
  });

  it("should throw on invalid sentiment value", () => {
    const raw = `{"brief": "Everything is fine.", "sentiment": "bullish"}`;
    expect(() => parseAnalysisResult(raw)).toThrowError(/sentiment "bullish" is invalid/);
  });

  it("should throw on non-JSON", () => {
    const raw = `Not a JSON string`;
    expect(() => parseAnalysisResult(raw)).toThrowError(/not valid JSON/);
  });
});
