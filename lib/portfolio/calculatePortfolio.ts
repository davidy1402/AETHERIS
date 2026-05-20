import {
  PortfolioHolding,
  MarketPrice,
  ExchangeRate,
  PortfolioSnapshot,
  PortfolioAssetSnapshot,
  AssetType,
} from "../types";

export function calculatePortfolio(
  holdings: PortfolioHolding[],
  prices: MarketPrice[],
  exchangeRate: ExchangeRate
): PortfolioSnapshot {
  const assets: PortfolioAssetSnapshot[] = [];

  // Create a map of prices for fast lookup
  const priceMap = new Map<string, MarketPrice>();
  prices.forEach((p) => priceMap.set(p.id, p));

  holdings.forEach((holding) => {
    const marketPrice = priceMap.get(holding.id);
    
    // Fallbacks if price is missing
    const currentPrice = marketPrice ? marketPrice.currentPrice : holding.costPrice;
    const dayChangePercent = marketPrice ? marketPrice.dayChangePercent : 0;
    const history30d = marketPrice ? marketPrice.history30d : [];

    const costValueNative = holding.costPrice * holding.quantity;
    const marketValueNative = currentPrice * holding.quantity;
    const profitLossNative = marketValueNative - costValueNative;
    const roiPercent = costValueNative > 0 ? (profitLossNative / costValueNative) * 100 : 0;

    let marketValueMYR = 0;
    let marketValueUSD = 0;
    let profitLossMYR = 0;

    if (holding.currency === "USD") {
      marketValueUSD = marketValueNative;
      marketValueMYR = marketValueNative * exchangeRate.usdToMyr;
      profitLossMYR = profitLossNative * exchangeRate.usdToMyr;
    } else {
      // currency === "MYR"
      marketValueMYR = marketValueNative;
      marketValueUSD = marketValueNative * exchangeRate.myrToUsd;
      profitLossMYR = profitLossNative;
    }

    assets.push({
      id: holding.id,
      name: holding.name,
      type: holding.type,
      exchange: holding.exchange,
      currency: holding.currency,
      costPrice: holding.costPrice,
      quantity: holding.quantity,
      currentPrice,
      marketValueNative,
      marketValueMYR,
      marketValueUSD,
      costValueNative,
      profitLossNative,
      profitLossMYR,
      roiPercent,
      dayChangePercent,
      history30d,
    });
  });

  // Calculate totals
  let totalMarketValueMYR = 0;
  let totalMarketValueUSD = 0;
  let totalProfitLossMYR = 0;
  let totalCostMYR = 0;

  assets.forEach((asset) => {
    totalMarketValueMYR += asset.marketValueMYR;
    totalMarketValueUSD += asset.marketValueUSD;
    totalProfitLossMYR += asset.profitLossMYR;
    
    // Convert asset cost to MYR for aggregate ROI denominator
    if (asset.currency === "USD") {
      totalCostMYR += asset.costValueNative * exchangeRate.usdToMyr;
    } else {
      totalCostMYR += asset.costValueNative;
    }
  });

  const totalProfitLossUSD = totalProfitLossMYR * exchangeRate.myrToUsd;
  const totalRoiPercent = totalCostMYR > 0 ? (totalProfitLossMYR / totalCostMYR) * 100 : 0;

  // Calculate category allocations
  const allocationMap = new Map<AssetType, number>();
  const allowedTypes: AssetType[] = ["stock", "etf", "fund"];
  allowedTypes.forEach((t) => allocationMap.set(t, 0));

  assets.forEach((asset) => {
    const currentVal = allocationMap.get(asset.type) || 0;
    allocationMap.set(asset.type, currentVal + asset.marketValueMYR);
  });

  const allocation = allowedTypes.map((type) => {
    const marketValueMYR = allocationMap.get(type) || 0;
    const percentage = totalMarketValueMYR > 0 ? (marketValueMYR / totalMarketValueMYR) * 100 : 0;
    return {
      type,
      marketValueMYR: parseFloat(marketValueMYR.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  return {
    assets,
    totals: {
      marketValueMYR: parseFloat(totalMarketValueMYR.toFixed(2)),
      marketValueUSD: parseFloat(totalMarketValueUSD.toFixed(2)),
      profitLossMYR: parseFloat(totalProfitLossMYR.toFixed(2)),
      profitLossUSD: parseFloat(totalProfitLossUSD.toFixed(2)),
      roiPercent: parseFloat(totalRoiPercent.toFixed(2)),
    },
    allocation,
    exchangeRate,
    updatedAt: new Date().toISOString(),
  };
}
