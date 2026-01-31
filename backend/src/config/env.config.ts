import { getEnv } from "../utils/get-env.js";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
});

export const Env = envConfig();
