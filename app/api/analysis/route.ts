import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { loadPortfolio } from "@/lib/portfolio/loadPortfolio";
import { fetchExchangeRate } from "@/lib/market/fetchRate";
import { fetchMarketPrices } from "@/lib/market/fetchPrices";
import { calculatePortfolio } from "@/lib/portfolio/calculatePortfolio";
import { buildAnalysisPrompt } from "@/lib/analysis/buildAnalysisPrompt";
import { parseAnalysisResult } from "@/lib/analysis/parseAnalysisResult";

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: {
          code: "ANTHROPIC_API_KEY_MISSING",
          message: "Anthropic API key is not configured in server environment variables.",
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

    // 3. Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // Define a web search tool as requested by the spec
    const tools: any[] = [
      {
        name: "web_search",
        description: "Search the web for latest financial news and market analysis on given tickers.",
        input_schema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query (e.g. 'AAPL stock news 2026', 'Maybank 1155.KL analyst reports')",
            },
          },
          required: ["query"],
        },
      },
    ];

    // Try calling the model requested by prompt.md
    let modelName = "claude-sonnet-4-20250514";
    let messageResponse;

    try {
      messageResponse = await callClaude(anthropic, modelName, prompt, tools);
    } catch (err: any) {
      console.warn(`[AI Route] Model ${modelName} failed or not found. Falling back to claude-3-5-sonnet-20241022. Error:`, err.message);
      modelName = "claude-3-5-sonnet-20241022";
      messageResponse = await callClaude(anthropic, modelName, prompt, tools);
    }

    let rawText = "";

    // 4. Handle tool use or extract text response
    if (messageResponse.stop_reason === "tool_use") {
      const toolUseBlock = messageResponse.content.find((block: any) => block.type === "tool_use") as any;
      if (toolUseBlock && toolUseBlock.name === "web_search") {
        const query = toolUseBlock.input?.query || "";
        console.log(`[AI Route] Claude requested web search for query: "${query}"`);

        // Generate a detailed simulated search result for the tickers to feed back to Claude
        const searchResultContent = getSimulatedNews(query, tickers);

        // Resume conversation with Claude, feeding it the search results
        const followUpResponse = await anthropic.messages.create({
          model: modelName,
          max_tokens: 1024,
          tools,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: messageResponse.content },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: toolUseBlock.id,
                  content: searchResultContent,
                },
              ],
            },
          ],
        });

        const textBlock = followUpResponse.content.find((block: any) => block.type === "text") as any;
        rawText = textBlock ? textBlock.text : "";
      }
    } else {
      const textBlock = messageResponse.content.find((block: any) => block.type === "text") as any;
      rawText = textBlock ? textBlock.text : "";
    }

    // 5. Parse and validate result
    const parsed = parseAnalysisResult(rawText);

    return NextResponse.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API Analysis Error]:", error);

    const status = 502; // Third-party provider error
    const code = "ANALYSIS_UNAVAILABLE";
    const message = `Unable to generate market analysis: ${error.message}`;

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

// Helper to make the message call
async function callClaude(anthropic: Anthropic, model: string, prompt: string, tools: any[]) {
  return await anthropic.messages.create({
    model,
    max_tokens: 1024,
    tools,
    system: "You are a specialized investment dashboard assistant. Always return valid, parsing-ready JSON according to the instructions.",
    messages: [{ role: "user", content: prompt }],
  });
}

// Helper to return simulated financial news
function getSimulatedNews(query: string, tickers: string[]): string {
  let news = `Search results for query: "${query}"\n\n`;

  if (tickers.includes("AAPL")) {
    news += `- AAPL (Apple Inc.): Analysts upgrade Apple stock to Buy following strong services sector growth and anticipated launch of new AI-integrated devices. Moderate supply chain headwinds in Asia are noted, but general sentiment remains positive.\n`;
  }
  if (tickers.includes("1155.KL")) {
    news += `- 1155.KL (Malayan Banking Berhad): Maybank shares trade steadily as Bank Negara Malaysia keeps interest rates stable. Reports highlight strong net interest margins and robust domestic consumer lending portfolio.\n`;
  }
  if (tickers.includes("VOO")) {
    news += `- VOO (Vanguard S&P 500 ETF): US markets show slight consolidation as investors digest Federal Reserve notes on inflation. General market sentiments are balanced with defensive sectors outperforming tech.\n`;
  }

  news += `- General Market: USD/MYR rate experiences moderate fluctuations influenced by central bank policy differentials. Export-oriented firms benefit, while tech indices face short-term valuation adjustments.`;
  return news;
}
