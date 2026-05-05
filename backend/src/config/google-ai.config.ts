import { GoogleGenAI, Type } from "@google/genai";
import { Env } from "./env.config.js";

export const genAI = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

export const GEN_AI_MODEL = "gemini-2.5-flash";

export const reportInsightAIConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.STRING,
    },
    minItems: 3,
    maxItems: 4,
  },
};
