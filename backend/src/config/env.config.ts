import { getEnv } from "../utils/get-env.js";

/**
 * Environment configuration. Frozen for runtime immutability.
 */
const _Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI"),
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1h"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REFRESH_TOKEN: getEnv("GOOGLE_REFRESH_TOKEN"),
  GOOGLE_REDIRECT_URI: getEnv("GOOGLE_REDIRECT_URI"),
  GMAIL_SENDER: getEnv("GMAIL_SENDER"),

  CRON_SECRET: getEnv("CRON_SECRET"),
} as const;

export const Env = Object.freeze(_Env) as typeof _Env;

export type EnvConfigType = typeof Env;
