import { describe, it, expect } from "vitest";
import { mapYahooFinanceResponse } from "./yahooFinanceMapper";

describe("yahooFinanceMapper", () => {
  it("should successfully map a valid Yahoo Finance response", () => {
    const raw = {
      chart: {
        result: [
          {
            meta: {
              symbol: "AAPL",
              currency: "USD",
              regularMarketPrice: 189.30,
              chartPreviousClose: 190.50,
            },
            timestamp: [1714483800, 1714570200],
            indicators: {
              quote: [
                {
                  close: [185.50, 187.20],
                },
              ],
            },
          },
        ],
        error: null,
      },
    };

    const result = mapYahooFinanceResponse(raw);
    expect(result.id).toBe("AAPL");
    expect(result.currency).toBe("USD");
    expect(result.currentPrice).toBe(189.30);
    expect(result.dayChange).toBeCloseTo(-1.20, 2);
    expect(result.dayChangePercent).toBeCloseTo(-0.63, 2);
    expect(result.history30d).toHaveLength(2);
    expect(result.history30d[0].date).toBe("2024-04-30"); // 1714483800 * 1000
    expect(result.history30d[0].close).toBe(185.50);
  });

  it("should parse Bursa symbols to MYR", () => {
    const raw = {
      chart: {
        result: [
          {
            meta: {
              symbol: "1155.KL",
              currency: "MYR",
              regularMarketPrice: 10.12,
              chartPreviousClose: 10.08,
            },
          },
        ],
      },
    };

    const result = mapYahooFinanceResponse(raw);
    expect(result.id).toBe("1155.KL");
    expect(result.currency).toBe("MYR");
    expect(result.currentPrice).toBe(10.12);
  });

  it("should throw if Yahoo Finance returned error", () => {
    const raw = {
      chart: {
        result: null,
        error: {
          code: "NOT_FOUND",
          description: "Symbol not found",
        },
      },
    };

    expect(() => mapYahooFinanceResponse(raw)).toThrowError(/Yahoo Finance returned error/);
  });

  it("should throw if crucial fields are missing", () => {
    const rawMissingPrice = {
      chart: {
        result: [
          {
            meta: {
              symbol: "AAPL",
              currency: "USD",
            },
          },
        ],
      },
    };

    expect(() => mapYahooFinanceResponse(rawMissingPrice)).toThrowError(/Missing regularMarketPrice/);
  });
});
