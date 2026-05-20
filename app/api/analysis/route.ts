import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadPortfolio } from "@/lib/portfolio/loadPortfolio";
import { fetchExchangeRate } from "@/lib/market/fetchRate";
import { fetchMarketPrices } from "@/lib/market/fetchPrices";
import { calculatePortfolio } from "@/lib/portfolio/calculatePortfolio";
import { buildAnalysisPrompt } from "@/lib/analysis/buildAnalysisPrompt";
import { parseAnalysisResult } from "@/lib/analysis/parseAnalysisResult";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: {
          code: "GEMINI_API_KEY_MISSING",
          message: "Gemini API key is not configured in server environment variables (GEMINI_API_KEY is missing).",
        },
      },
      { status: 500 }
    );
  }

  try {
    // 1. Load holdings, rates, and prices to calculate the live portfolio snapshot
    const holdings = loadPortfolio();
    if (holdings.length === 0) {
      return NextResponse.json({
        brief: "投资组合为空，请在 data/portfolio.json 中配置持仓资产。",
        sentiment: "neutral",
        generatedAt: new Date().toISOString(),
      });
    }

    const exchangeRate = await fetchExchangeRate();
    const tickers = holdings.map((h) => h.id);
    const prices = await fetchMarketPrices(tickers);
    const snapshot = calculatePortfolio(holdings, prices, exchangeRate);

    // 2. Generate prompt
    const prompt = buildAnalysisPrompt(snapshot);

    // 3. Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try calling gemini-2.5-pro, fallback to gemini-1.5-pro
    let modelName = "gemini-2.5-pro";
    let rawText = "";

    try {
      rawText = await callGemini(genAI, modelName, prompt);
    } catch (err: any) {
      console.warn(`[AI Route] Gemini Model ${modelName} failed or not found. Falling back to gemini-1.5-pro. Error:`, err.message);
      modelName = "gemini-1.5-pro";
      rawText = await callGemini(genAI, modelName, prompt);
    }

    // 4. Parse and validate result
    const parsed = parseAnalysisResult(rawText);

    return NextResponse.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API Analysis Error]:", error);

    const status = 502; // Third-party provider error
    const code = "ANALYSIS_UNAVAILABLE";
    const message = `Unable to generate market analysis via Gemini: ${error.message}`;

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

// Helper to make the Gemini message call
async function callGemini(genAI: GoogleGenerativeAI, modelName: string, prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    // System instruction tells the model its role
    systemInstruction: "You are a specialized investment dashboard assistant. You analyze portfolio data, currencies, and perform web searches to assess risk.",
    tools: [{ googleSearch: {} }] as any,
    // Enforce JSON structured output using schema config
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          brief: {
            type: "STRING" as any,
            description: "One sentence summary in Chinese (Simplified), strictly under 60 characters, capturing the most critical risk or opportunity based on current market trends.",
          },
          sentiment: {
            type: "STRING" as any,
            enum: ["positive", "neutral", "negative"],
            description: "Overall market sentiment classification.",
          },
        },
        required: ["brief", "sentiment"],
      },
    },
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const rawText = response.response?.text();
  if (!rawText) {
    throw new Error("Empty response received from Gemini model.");
  }
  
  return rawText;
}
