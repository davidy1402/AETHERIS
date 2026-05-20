import { PortfolioSnapshot } from "../types";

export function buildAnalysisPrompt(snapshot: PortfolioSnapshot): string {
  const { assets, totals, allocation, exchangeRate } = snapshot;

  const assetsSummary = assets
    .map((asset) => {
      const weight = ((asset.marketValueMYR / totals.marketValueMYR) * 100).toFixed(1);
      return `- ${asset.name} (${asset.id}): Type=${asset.type}, Currency=${asset.currency}, Weight=${weight}%, Current ROI=${asset.roiPercent.toFixed(1)}%, Day Change=${asset.dayChangePercent.toFixed(1)}%`;
    })
    .join("\n");

  const allocationSummary = allocation
    .map((alloc) => `${alloc.type}: ${alloc.percentage}%`)
    .join(", ");

  const totalMarketValMYR = totals.marketValueMYR.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const totalProfitLossMYR = totals.profitLossMYR.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const sign = totals.profitLossMYR >= 0 ? "+" : "";

  return `
You are a senior investment strategist and risk officer. Analyze the following portfolio:

[PORTFOLIO OVERVIEW]
- Total Market Value: MYR ${totalMarketValMYR} (USD ${(totals.marketValueUSD).toLocaleString("en-US", { maximumFractionDigits: 2 })})
- Total Profit/Loss: MYR ${sign}${totalProfitLossMYR}
- Overall Portfolio ROI: ${totals.roiPercent.toFixed(2)}%
- USD/MYR FX Rate: ${exchangeRate.usdToMyr}
- Asset Class Allocations: ${allocationSummary}

[INDIVIDUAL HOLDINGS]
${assetsSummary}

[INSTRUCTIONS]
Based on the portfolio structure, allocations, currency exposure, and market context, generate a one-sentence market risk summary (risk briefing).
You MUST respond ONLY with a raw JSON object matching the following TypeScript interface (do not wrap in markdown code blocks like \`\`\`json or add extra text):
{
  "brief": "One sentence summary in Chinese (Simplified), strictly under 60 characters, capturing the most critical risk or opportunity.",
  "sentiment": "positive" | "neutral" | "negative"
}

Define "sentiment" as:
- "positive": The portfolio is positioned well with strong positive momentum and minimal immediate threats.
- "negative": High downside risk, FX exposure risks, or severe sector pressure.
- "neutral": Balanced posture, mixed signals, or transitionary phase.

JSON Response:`;
}
