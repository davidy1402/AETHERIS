export type AssetType = "stock" | "etf" | "fund";
export type Currency = "MYR" | "USD";

export interface PortfolioHolding {
  id: string; // Ticker e.g. "AAPL", "1155.KL"
  name: string;
  type: AssetType;
  exchange: string;
  currency: Currency;
  costPrice: number;
  quantity: number;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  close: number;
}

export interface MarketPrice {
  id: string;
  currency: Currency;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  history30d: PricePoint[];
  updatedAt: string;
}

export interface ExchangeRate {
  base: "USD";
  target: "MYR";
  usdToMyr: number;
  myrToUsd: number;
  updatedAt: string;
}

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

export type MarketSentiment = "positive" | "neutral" | "negative";

export interface AnalysisResult {
  brief: string;
  sentiment: MarketSentiment;
  generatedAt: string;
}
