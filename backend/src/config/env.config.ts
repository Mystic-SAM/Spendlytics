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

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1h"),
} as const;

export const Env = Object.freeze(_Env) as typeof _Env;

export type EnvConfigType = typeof Env;
