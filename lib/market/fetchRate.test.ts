import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchExchangeRate } from "./fetchRate";

describe("fetchExchangeRate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should throw an error if EXCHANGE_RATE_API_KEY is not defined", async () => {
    delete process.env.EXCHANGE_RATE_API_KEY;
    try {
      await fetchExchangeRate();
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.code).toBe("EXCHANGE_RATE_API_KEY_MISSING");
    }
  });

  it("should successfully fetch and return exchange rate", async () => {
    process.env.EXCHANGE_RATE_API_KEY = "test-key";
    
    const mockResponse = {
      result: "success",
      conversion_rates: {
        MYR: 4.75,
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchExchangeRate();
    expect(result.usdToMyr).toBe(4.75);
    expect(result.myrToUsd).toBeCloseTo(1 / 4.75, 5);
  });

  it("should throw if the provider returns an error", async () => {
    process.env.EXCHANGE_RATE_API_KEY = "test-key";
    
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response);

    try {
      await fetchExchangeRate();
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.code).toBe("EXCHANGE_RATE_PROVIDER_ERROR");
    }
  });
});
