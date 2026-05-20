import { PortfolioHolding, AssetType, Currency } from "../types";

export class PortfolioError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PortfolioError";
    this.code = code;
  }
}

export function validatePortfolio(data: any): PortfolioHolding[] {
  if (!Array.isArray(data)) {
    throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", "Portfolio configuration must be a JSON array.");
  }

  const validated: PortfolioHolding[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const indexStr = `at index ${i}`;

    if (!item || typeof item !== "object") {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding ${indexStr} is not a valid object.`);
    }

    const { id, name, type, exchange, currency, costPrice, quantity } = item;

    if (typeof id !== "string" || id.trim() === "") {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding ${indexStr} has missing or empty "id".`);
    }

    if (typeof name !== "string" || name.trim() === "") {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding "${id}" (${indexStr}) has missing or empty "name".`);
    }

    const allowedTypes: AssetType[] = ["stock", "etf", "fund"];
    if (!allowedTypes.includes(type)) {
      throw new PortfolioError(
        "PORTFOLIO_SCHEMA_INVALID",
        `Holding "${id}" (${indexStr}) has invalid type "${type}". Allowed: ${allowedTypes.join(", ")}.`
      );
    }

    if (typeof exchange !== "string" || exchange.trim() === "") {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding "${id}" (${indexStr}) has missing or empty "exchange".`);
    }

    const allowedCurrencies: Currency[] = ["MYR", "USD"];
    if (!allowedCurrencies.includes(currency)) {
      throw new PortfolioError(
        "PORTFOLIO_SCHEMA_INVALID",
        `Holding "${id}" (${indexStr}) has invalid currency "${currency}". Allowed: ${allowedCurrencies.join(", ")}.`
      );
    }

    if (typeof costPrice !== "number" || isNaN(costPrice) || costPrice <= 0) {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding "${id}" (${indexStr}) must have "costPrice" greater than 0.`);
    }

    if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0) {
      throw new PortfolioError("PORTFOLIO_SCHEMA_INVALID", `Holding "${id}" (${indexStr}) must have "quantity" greater than 0.`);
    }

    validated.push({
      id: id.trim(),
      name: name.trim(),
      type: type as AssetType,
      exchange: exchange.trim(),
      currency: currency as Currency,
      costPrice,
      quantity,
    });
  }

  return validated;
}
