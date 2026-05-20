import { MarketPrice } from "../types";
import { mapYahooFinanceResponse } from "./yahooFinanceMapper";

export async function fetchMarketPrices(tickers: string[]): Promise<MarketPrice[]> {
  if (tickers.length === 0) {
    return [];
  }

  const promises = tickers.map(async (ticker) => {
    // Yahoo Finance unofficial chart endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=30d&interval=1d`;

    try {
      const res = await fetch(url, {
        next: { revalidate: 60 }, // Cache on server for 60s
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return mapYahooFinanceResponse(data);
    } catch (err: any) {
      // Individual ticker fetch fails should not block others.
      // Log the warning and return null, which gets filtered out.
      console.warn(`[fetchMarketPrices] Failed to fetch ticker "${ticker}":`, err.message);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((p): p is MarketPrice => p !== null);
}
