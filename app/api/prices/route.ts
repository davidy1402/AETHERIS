import { NextResponse } from "next/server";
import { loadPortfolio } from "@/lib/portfolio/loadPortfolio";
import { fetchExchangeRate } from "@/lib/market/fetchRate";
import { fetchMarketPrices } from "@/lib/market/fetchPrices";
import { calculatePortfolio } from "@/lib/portfolio/calculatePortfolio";
import { PortfolioError } from "@/lib/portfolio/validatePortfolio";
import { MarketDataError } from "@/lib/market/yahooFinanceMapper";

export async function GET() {
  try {
    // 1. Load and validate portfolio configuration
    const holdings = loadPortfolio();

    if (holdings.length === 0) {
      // Gracefully handle empty portfolio
      return NextResponse.json({
        assets: [],
        totals: {
          marketValueMYR: 0,
          marketValueUSD: 0,
          profitLossMYR: 0,
          profitLossUSD: 0,
          roiPercent: 0,
        },
        allocation: [
          { type: "stock", marketValueMYR: 0, percentage: 0 },
          { type: "etf", marketValueMYR: 0, percentage: 0 },
          { type: "fund", marketValueMYR: 0, percentage: 0 },
        ],
        exchangeRate: {
          base: "USD",
          target: "MYR",
          usdToMyr: 4.70, // generic fallback if rate is requested for empty portfolio
          myrToUsd: 1 / 4.70,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Fetch exchange rate
    // Note: this will throw if key is missing or endpoint fails
    const exchangeRate = await fetchExchangeRate();

    // 3. Fetch current market prices for all tickers in the portfolio
    const tickers = holdings.map((h) => h.id);
    const prices = await fetchMarketPrices(tickers);

    // 4. Calculate portfolio valuation metrics
    const snapshot = calculatePortfolio(holdings, prices, exchangeRate);

    return NextResponse.json(snapshot);
  } catch (error: any) {
    console.error("[API Prices Error]:", error);

    // Differentiate error types and assign status codes
    let status = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = error.message || "An unexpected error occurred.";

    if (error instanceof PortfolioError) {
      status = 500; // Local configuration errors are 500
      code = error.code;
    } else if (error instanceof MarketDataError) {
      code = error.code;
      if (
        code === "EXCHANGE_RATE_API_KEY_MISSING" ||
        code === "EXCHANGE_RATE_FORMAT_INVALID" ||
        code === "MARKET_DATA_FORMAT_INVALID"
      ) {
        status = 500; // Missing keys or mapping bugs are server configuration/logic issues
      } else if (code === "EXCHANGE_RATE_UNAVAILABLE" || code === "MARKET_DATA_UNAVAILABLE") {
        status = 502; // Third-party provider down
      } else if (code === "EXCHANGE_RATE_PROVIDER_ERROR" || code === "MARKET_DATA_PROVIDER_ERROR") {
        status = 502;
      }
    }

    return NextResponse.json(
      {
        error: {
          code,
          message,
        },
      },
      { status }
    );
  }
}
