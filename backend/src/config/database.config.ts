import mongoose from "mongoose";
import { Env } from "./env.config.js";
import { Logger } from "../utils/logger.js";

const MONGO_SERVER_SELECTION_TIMEOUT_MS = 8000;
const MONGO_SOCKET_TIMEOUT_MS = 45000;
const MONGO_CONNECT_TIMEOUT_MS = 30000;

/**
 * Connects to MongoDB database using credentials from environment config.
 * Caches the connection so serverless re-invocations reuse the existing
 * connection instead of exhausting the Atlas connection pool.
 * @returns {Promise<void>} Resolves when connected (or already connected)
 */
export const connectDatabase = async (): Promise<void> => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) {
    Logger.info("Reusing existing MongoDB connection");
    return;
  }

  if (mongoose.connection.readyState === 2) {
    // Wait for the in-progress connection to finish
    await new Promise<void>((resolve) =>
      mongoose.connection.once("connected", resolve),
    );
    return;
  }

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
