import { ExchangeRate } from "../types";
import { MarketDataError } from "./yahooFinanceMapper";

export async function fetchExchangeRate(): Promise<ExchangeRate> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new MarketDataError(
      "EXCHANGE_RATE_API_KEY_MISSING",
      "Exchange rate API key (EXCHANGE_RATE_API_KEY) is not configured in environment variables."
    );
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache on server-side for 1 hour to prevent API quota depletion
    });

    if (!res.ok) {
      throw new MarketDataError(
        "EXCHANGE_RATE_PROVIDER_ERROR",
        `Exchange rate provider returned status ${res.status}: ${res.statusText}`
      );
    }

    const data = await res.json();

    if (data.result !== "success") {
      throw new MarketDataError(
        "EXCHANGE_RATE_PROVIDER_ERROR",
        `Exchange rate API error: ${data["error-type"] || "unknown error"}`
      );
    }

    const usdToMyr = data.conversion_rates?.MYR;
    if (typeof usdToMyr !== "number" || isNaN(usdToMyr)) {
      throw new MarketDataError(
        "EXCHANGE_RATE_FORMAT_INVALID",
        "Invalid exchange rate response format (MYR rate missing)."
      );
    }

    const myrToUsd = 1 / usdToMyr;

    return {
      base: "USD",
      target: "MYR",
      usdToMyr: parseFloat(usdToMyr.toFixed(6)),
      myrToUsd: parseFloat(myrToUsd.toFixed(6)),
      updatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    if (error instanceof MarketDataError) {
      throw error;
    }
    throw new MarketDataError(
      "EXCHANGE_RATE_UNAVAILABLE",
      `Unable to fetch exchange rate: ${error.message}`
    );
  }
}
