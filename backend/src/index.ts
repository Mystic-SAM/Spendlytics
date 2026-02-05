import "dotenv/config";
import { Env } from "./config/env.config.js";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { HTTP_STATUS } from "./config/http.config.js";
import { ErrorHandler } from "./middleware/errorHandler.middleware.js";
import { asyncHandler } from "./middleware/asyncHandler.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import { Logger } from "./utils/logger.js";
import { NotFoundException } from "./utils/app-error.js";
import { connectDatabase } from "./config/database.config.js";

// Initialize logger (setup file logging and cleanup old logs)
Logger.initialize();

const app = express();

/* Middleware Setup */

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

/* Routes */

/**
 * Health check endpoint for deployment monitoring
 */
app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: Env.NODE_ENV,
    });
  }),
);

/**
 * Welcome endpoint
 */
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: "Hello, This is the Expense Tracker Backend!",
      version: "1.0.0",
    });
  }),
);

/**
 * 404 handler for undefined routes
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Route ${req.method} ${req.path} not found`));
});

app.use(ErrorHandler);

// Server Startup & Graceful Shutdown
const server = app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode.`);
  Logger.info(`Server started successfully`, {
    port: Env.PORT,
    environment: Env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Graceful shutdown handler
 * Closes the server and completes pending requests
 */
const gracefulShutdown = (signal: string) => {
  Logger.info(`${signal} signal received: closing HTTP server`, {
    signal,
    timestamp: new Date().toISOString(),
  });

  server.close(() => {
    Logger.info("HTTP server closed", {
      timestamp: new Date().toISOString(),
    });
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    Logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  Logger.error("Uncaught Exception", error, {
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any) => {
  Logger.error("Unhandled Rejection", reason, {
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
