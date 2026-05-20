import { describe, it, expect } from "vitest";
import { validatePortfolio, PortfolioError } from "./validatePortfolio";

describe("validatePortfolio", () => {
  it("should validate and return valid holdings", () => {
    const valid = [
      {
        id: "AAPL",
        name: "Apple Inc.",
        type: "stock",
        exchange: "NASDAQ",
        currency: "USD",
        costPrice: 178.50,
        quantity: 10,
      },
      {
        id: "1155.KL",
        name: "Malayan Banking Berhad",
        type: "stock",
        exchange: "Bursa",
        currency: "MYR",
        costPrice: 9.20,
        quantity: 500,
      },
    ];

    const result = validatePortfolio(valid);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("AAPL");
    expect(result[1].currency).toBe("MYR");
  });

  it("should throw if the root is not an array", () => {
    expect(() => validatePortfolio({})).toThrowError(/JSON array/);
  });

  it("should throw if id is missing or empty", () => {
    const invalid = [{ name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: 10, quantity: 1 }];
    expect(() => validatePortfolio(invalid)).toThrowError(/missing or empty "id"/);

    const emptyId = [{ id: " ", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: 10, quantity: 1 }];
    expect(() => validatePortfolio(emptyId)).toThrowError(/missing or empty "id"/);
  });

  it("should throw if currency is invalid", () => {
    const invalid = [
      { id: "AAPL", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "SGD", costPrice: 10, quantity: 1 }
    ];
    expect(() => validatePortfolio(invalid)).toThrowError(/invalid currency/);
  });

  it("should throw if type is invalid", () => {
    const invalid = [
      { id: "AAPL", name: "Apple", type: "crypto", exchange: "NASDAQ", currency: "USD", costPrice: 10, quantity: 1 }
    ];
    expect(() => validatePortfolio(invalid)).toThrowError(/invalid type/);
  });

  it("should throw if costPrice is negative or zero", () => {
    const zeroPrice = [
      { id: "AAPL", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: 0, quantity: 1 }
    ];
    expect(() => validatePortfolio(zeroPrice)).toThrowError(/costPrice" greater than 0/);

    const negPrice = [
      { id: "AAPL", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: -5.5, quantity: 1 }
    ];
    expect(() => validatePortfolio(negPrice)).toThrowError(/costPrice" greater than 0/);
  });

  it("should throw if quantity is negative or zero", () => {
    const zeroQty = [
      { id: "AAPL", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: 10, quantity: 0 }
    ];
    expect(() => validatePortfolio(zeroQty)).toThrowError(/quantity" greater than 0/);

    const negQty = [
      { id: "AAPL", name: "Apple", type: "stock", exchange: "NASDAQ", currency: "USD", costPrice: 10, quantity: -2 }
    ];
    expect(() => validatePortfolio(negQty)).toThrowError(/quantity" greater than 0/);
  });
});
