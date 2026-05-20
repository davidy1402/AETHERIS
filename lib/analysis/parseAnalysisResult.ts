import { AnalysisResult, MarketSentiment } from "../types";

export class AnalysisError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "AnalysisError";
    this.code = code;
  }
}

export function parseAnalysisResult(rawText: string): Omit<AnalysisResult, "generatedAt"> {
  if (!rawText || rawText.trim() === "") {
    throw new AnalysisError("ANALYSIS_RESULT_INVALID", "AI response is empty.");
  }

  // Sanitization: strip markdown code blocks if any
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    // Remove starting ```json or ```
    cleanText = cleanText.replace(/^```(json)?\s*/i, "");
    // Remove trailing ```
    cleanText = cleanText.replace(/\s*```$/, "");
  }
  cleanText = cleanText.trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanText);
  } catch (err: any) {
    throw new AnalysisError(
      "ANALYSIS_RESULT_INVALID",
      `AI response is not valid JSON: ${err.message}. Original text: ${rawText}`
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AnalysisError("ANALYSIS_RESULT_INVALID", "AI response must parse to a JSON object.");
  }

  const { brief, sentiment } = parsed;

  if (typeof brief !== "string" || brief.trim() === "") {
    throw new AnalysisError("ANALYSIS_RESULT_INVALID", "AI response is missing a valid 'brief' string.");
  }

  const allowedSentiments: MarketSentiment[] = ["positive", "neutral", "negative"];
  if (!allowedSentiments.includes(sentiment)) {
    throw new AnalysisError(
      "ANALYSIS_RESULT_INVALID",
      `AI response sentiment "${sentiment}" is invalid. Allowed: ${allowedSentiments.join(", ")}.`
    );
  }

  return {
    brief: brief.trim(),
    sentiment: sentiment as MarketSentiment,
  };
}
