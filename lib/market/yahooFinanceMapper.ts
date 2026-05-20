import { MarketPrice, PricePoint, Currency } from "../types";

export class MarketDataError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "MarketDataError";
    this.code = code;
  }
}

export function mapYahooFinanceResponse(rawJson: any): MarketPrice {
  try {
    const result = rawJson?.chart?.result?.[0];
    const error = rawJson?.chart?.error;

    if (error) {
      throw new MarketDataError(
        "MARKET_DATA_PROVIDER_ERROR",
        `Yahoo Finance returned error: ${error.description || error.code || JSON.stringify(error)}`
      );
    }

    if (!result) {
      throw new MarketDataError("MARKET_DATA_UNAVAILABLE", "No data returned from Yahoo Finance.");
    }

    const meta = result.meta;
    if (!meta) {
      throw new MarketDataError("MARKET_DATA_FORMAT_INVALID", "Missing metadata in Yahoo Finance response.");
    }

    const id = meta.symbol;
    if (!id) {
      throw new MarketDataError("MARKET_DATA_FORMAT_INVALID", "Missing symbol in Yahoo Finance metadata.");
    }

    const rawCurrency = meta.currency?.toUpperCase();
    let currency: Currency = "USD";
    if (rawCurrency === "MYR" || id.endsWith(".KL")) {
      currency = "MYR";
    } else if (rawCurrency === "USD") {
      currency = "USD";
    } else {
      // Default fallback or warning
      currency = "USD";
    }

    const currentPrice = meta.regularMarketPrice;
    if (typeof currentPrice !== "number" || isNaN(currentPrice)) {
      throw new MarketDataError("MARKET_DATA_FORMAT_INVALID", `Missing regularMarketPrice for symbol ${id}.`);
    }

    // Attempt to calculate dayChange
    const previousClose = meta.chartPreviousClose ?? meta.previousClose;
    let dayChange = 0;
    let dayChangePercent = 0;

    if (typeof previousClose === "number" && previousClose > 0) {
      dayChange = currentPrice - previousClose;
      dayChangePercent = (dayChange / previousClose) * 100;
    }

    // Process historical price points
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0]?.close || [];
    const history30d: PricePoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      const close = quotes[i];

      // Exclude null/undefined close values
      if (ts && typeof close === "number" && !isNaN(close)) {
        const date = new Date(ts * 1000).toISOString().split("T")[0];
        history30d.push({
          date,
          close: parseFloat(close.toFixed(2)),
        });
      }
    }

    return {
      id,
      currency,
      currentPrice: parseFloat(currentPrice.toFixed(4)),
      dayChange: parseFloat(dayChange.toFixed(4)),
      dayChangePercent: parseFloat(dayChangePercent.toFixed(2)),
      history30d,
      updatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    if (err instanceof MarketDataError) {
      throw err;
    }
    throw new MarketDataError("MARKET_DATA_FORMAT_INVALID", `Failed to parse Yahoo Finance response: ${err.message}`);
  }
}
