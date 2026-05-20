import { PortfolioSnapshot, PricePoint } from "./types";

// Helper to generate mock historical prices for the last 30 days
const generateHistory = (basePrice: number, dailyVolatility: number, trend: number): PricePoint[] => {
  const points: PricePoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    // Simple pseudo-random price walk
    const factor = 1 + (Math.sin(i / 2) * dailyVolatility) + (trend * (30 - i) / 30);
    points.push({
      date: dateString,
      close: parseFloat((basePrice * factor).toFixed(2)),
    });
  }
  return points;
};

export const mockPortfolioSnapshot: PortfolioSnapshot = {
  assets: [
    {
      id: "1155.KL",
      name: "Malayan Banking Berhad",
      type: "stock",
      exchange: "Bursa",
      currency: "MYR",
      costPrice: 9.20,
      quantity: 500,
      currentPrice: 10.12,
      marketValueNative: 5060.00,
      marketValueMYR: 5060.00,
      marketValueUSD: 1076.60,
      costValueNative: 4600.00,
      profitLossNative: 460.00,
      profitLossMYR: 460.00,
      roiPercent: 10.00,
      dayChangePercent: 0.40,
      history30d: generateHistory(10.12, 0.02, 0.05),
    },
    {
      id: "AAPL",
      name: "Apple Inc.",
      type: "stock",
      exchange: "NASDAQ",
      currency: "USD",
      costPrice: 178.50,
      quantity: 10,
      currentPrice: 189.30,
      marketValueNative: 1893.00,
      marketValueMYR: 8897.10,
      marketValueUSD: 1893.00,
      costValueNative: 1785.00,
      profitLossNative: 108.00,
      profitLossMYR: 507.60,
      roiPercent: 6.05,
      dayChangePercent: -1.20,
      history30d: generateHistory(189.30, 0.03, -0.02),
    },
    {
      id: "VOO",
      name: "Vanguard S&P 500 ETF",
      type: "etf",
      exchange: "NYSE",
      currency: "USD",
      costPrice: 420.00,
      quantity: 5,
      currentPrice: 460.00,
      marketValueNative: 2300.00,
      marketValueMYR: 10810.00,
      marketValueUSD: 2300.00,
      costValueNative: 2100.00,
      profitLossNative: 200.00,
      profitLossMYR: 940.00,
      roiPercent: 9.52,
      dayChangePercent: 0.20,
      history30d: generateHistory(460.00, 0.015, 0.04),
    }
  ],
  totals: {
    marketValueMYR: 24767.10,
    marketValueUSD: 5269.60,
    profitLossMYR: 1907.60,
    profitLossUSD: 405.87,
    roiPercent: 8.34,
  },
  allocation: [
    {
      type: "stock",
      marketValueMYR: 13957.10,
      percentage: 56.35,
    },
    {
      type: "etf",
      marketValueMYR: 10810.00,
      percentage: 43.65,
    },
    {
      type: "fund",
      marketValueMYR: 0.00,
      percentage: 0.00,
    }
  ],
  exchangeRate: {
    base: "USD",
    target: "MYR",
    usdToMyr: 4.70,
    myrToUsd: 0.212765,
    updatedAt: new Date().toISOString(),
  },
  updatedAt: new Date().toISOString(),
};
