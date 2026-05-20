import { describe, it, expect } from "vitest";
import { calculatePortfolio } from "./calculatePortfolio";
import { PortfolioHolding, MarketPrice, ExchangeRate } from "../types";

describe("calculatePortfolio", () => {
  const exchangeRate: ExchangeRate = {
    base: "USD",
    target: "MYR",
    usdToMyr: 4.70,
    myrToUsd: 1 / 4.70,
    updatedAt: "2026-05-20T00:00:00Z",
  };

  const holdings: PortfolioHolding[] = [
    {
      id: "AAPL",
      name: "Apple Inc.",
      type: "stock",
      exchange: "NASDAQ",
      currency: "USD",
      costPrice: 150.00,
      quantity: 10,
    },
    {
      id: "1155.KL",
      name: "Maybank",
      type: "stock",
      exchange: "Bursa",
      currency: "MYR",
      costPrice: 9.00,
      quantity: 500,
    },
    {
      id: "VOO",
      name: "VOO",
      type: "etf",
      exchange: "NYSE",
      currency: "USD",
      costPrice: 400.00,
      quantity: 5,
    }
  ];

  const prices: MarketPrice[] = [
    {
      id: "AAPL",
      currency: "USD",
      currentPrice: 180.00,
      dayChange: 2.50,
      dayChangePercent: 1.40,
      history30d: [],
      updatedAt: "2026-05-20T00:00:00Z",
    },
    {
      id: "1155.KL",
      currency: "MYR",
      currentPrice: 9.90,
      dayChange: 0.10,
      dayChangePercent: 1.02,
      history30d: [],
      updatedAt: "2026-05-20T00:00:00Z",
    },
    {
      id: "VOO",
      currency: "USD",
      currentPrice: 420.00,
      dayChange: -1.00,
      dayChangePercent: -0.24,
      history30d: [],
      updatedAt: "2026-05-20T00:00:00Z",
    }
  ];

  it("should calculate single asset properties correctly (USD asset)", () => {
    const snapshot = calculatePortfolio([holdings[0]], [prices[0]], exchangeRate);
    const apple = snapshot.assets[0];

    expect(apple.costValueNative).toBe(1500); // 150 * 10
    expect(apple.marketValueNative).toBe(1800); // 180 * 10
    expect(apple.profitLossNative).toBe(300);
    expect(apple.roiPercent).toBe(20);
    expect(apple.marketValueUSD).toBe(1800);
    expect(apple.marketValueMYR).toBe(1800 * 4.70);
    expect(apple.profitLossMYR).toBe(300 * 4.70);
  });

  it("should calculate single asset properties correctly (MYR asset)", () => {
    const snapshot = calculatePortfolio([holdings[1]], [prices[1]], exchangeRate);
    const maybank = snapshot.assets[0];

    expect(maybank.costValueNative).toBe(4500); // 9 * 500
    expect(maybank.marketValueNative).toBe(4950); // 9.9 * 500
    expect(maybank.profitLossNative).toBe(450);
    expect(maybank.roiPercent).toBe(10);
    expect(maybank.marketValueMYR).toBe(4950);
    expect(maybank.marketValueUSD).toBeCloseTo(4950 / 4.70, 5);
  });

  it("should aggregate total portfolio values correctly", () => {
    const snapshot = calculatePortfolio(holdings, prices, exchangeRate);
    
    // Expected calculations:
    // Costs in MYR:
    // AAPL: 1500 USD * 4.7 = 7050 MYR
    // Maybank: 4500 MYR
    // VOO: 2000 USD * 4.7 = 9400 MYR
    // Total Cost MYR = 7050 + 4500 + 9400 = 21000 MYR
    //
    // Market Values in MYR:
    // AAPL: 1800 USD * 4.7 = 8460 MYR
    // Maybank: 4950 MYR
    // VOO: 2100 USD * 4.7 = 9870 MYR
    // Total Market Value MYR = 8460 + 4950 + 9870 = 23280 MYR
    //
    // Profits in MYR:
    // AAPL: 300 USD * 4.7 = 1410 MYR
    // Maybank: 450 MYR
    // VOO: 100 USD * 4.7 = 470 MYR
    // Total Profit MYR = 1410 + 450 + 470 = 2330 MYR
    //
    // Total ROI = (2330 / 21000) * 100% = 11.095% => 11.10%

    expect(snapshot.totals.marketValueMYR).toBe(23280);
    expect(snapshot.totals.profitLossMYR).toBe(2330);
    expect(snapshot.totals.roiPercent).toBeCloseTo(11.10, 1);
  });

  it("should calculate asset allocations correctly", () => {
    const snapshot = calculatePortfolio(holdings, prices, exchangeRate);
    
    // Total Market Value = 23280 MYR
    // Stock (AAPL + Maybank) = 8460 + 4950 = 13410 MYR (57.60%)
    // ETF (VOO) = 9870 MYR (42.40%)
    // Fund = 0 (0.00%)

    const stockAlloc = snapshot.allocation.find(a => a.type === "stock");
    const etfAlloc = snapshot.allocation.find(a => a.type === "etf");
    const fundAlloc = snapshot.allocation.find(a => a.type === "fund");

    expect(stockAlloc?.percentage).toBeCloseTo(57.60, 1);
    expect(etfAlloc?.percentage).toBeCloseTo(42.40, 1);
    expect(fundAlloc?.percentage).toBe(0);
  });
});
