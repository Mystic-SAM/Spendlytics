import mongoose from "mongoose";
import { Env } from "./env.config.js";
import { Logger } from "../utils/logger.js";

const MONGO_SERVER_SELECTION_TIMEOUT_MS = 8000;
const MONGO_SOCKET_TIMEOUT_MS = 45000;
const MONGO_CONNECT_TIMEOUT_MS = 30000;

/**
 * Connects to MongoDB database using credentials from environment config.
 * Validates that MONGO_URI is set before attempting connection.
 * @returns {Promise<void>} Resolves when connected successfully
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(Env.MONGO_URI, {
      serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: MONGO_SOCKET_TIMEOUT_MS,
      connectTimeoutMS: MONGO_CONNECT_TIMEOUT_MS,
    });

    console.log("Connected to MongoDB database");
    Logger.info("Connected to MongoDB database");
  } catch (error) {
    Logger.error("Error connecting to MongoDB database:", error);
    process.exit(1);
  }
};
