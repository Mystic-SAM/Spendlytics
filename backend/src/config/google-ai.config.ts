import { GoogleGenAI } from "@google/genai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

export const GEN_AI_MODEL = "gemini-2.5-flash";

export const reportInsightAIConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "array",
    items: {
      type: "string",
    },
    minItems: 3,
    maxItems: 4,
  },
};
