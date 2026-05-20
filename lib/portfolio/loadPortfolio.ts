import fs from "fs";
import path from "path";
import { PortfolioHolding } from "../types";
import { validatePortfolio, PortfolioError } from "./validatePortfolio";

export function loadPortfolio(): PortfolioHolding[] {
  const filePath = path.join(process.cwd(), "data", "portfolio.json");

  if (!fs.existsSync(filePath)) {
    throw new PortfolioError(
      "PORTFOLIO_FILE_NOT_FOUND",
      "Portfolio configuration file (portfolio.json) was not found."
    );
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(filePath, "utf-8");
  } catch (error: any) {
    throw new PortfolioError(
      "PORTFOLIO_FILE_NOT_FOUND",
      `Unable to read portfolio file: ${error.message}`
    );
  }

  let parsedData: any;
  try {
    parsedData = JSON.parse(fileContent);
  } catch (error: any) {
    throw new PortfolioError(
      "PORTFOLIO_JSON_INVALID",
      `Portfolio JSON file contains syntax errors: ${error.message}`
    );
  }

  return validatePortfolio(parsedData);
}
