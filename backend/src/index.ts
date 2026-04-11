import "dotenv/config";
import "./config/passport.config.js";
import { Env } from "./config/env.config.js";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { HTTP_STATUS } from "./config/http.config.js";
import { ErrorHandler } from "./middlewares/errorHandler.middleware.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import { Logger } from "./utils/logger.js";
import { NotFoundException } from "./utils/app-error.js";
import { connectDatabase } from "./config/database.config.js";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import { passportAuthenticateJwt } from "./config/passport.config.js";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import reportRoutes from "./routes/report.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { cronAuthMiddleware } from "./middlewares/cronAuth.middleware.js";

// Initialize logger (setup file logging and cleanup old logs)
Logger.initialize();

const app = express();
const BASE_PATH = Env.BASE_PATH;

/* Middleware Setup */

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

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

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);

// Internal cron endpoints — secured via CRON_SECRET header (triggered by Vercel Cron)
app.use(`${BASE_PATH}/crons`, cronAuthMiddleware, cronRoutes);

/**
 * 404 handler for undefined routes
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Route ${req.method} ${req.path} not found`));
});

app.use(ErrorHandler);

// Server Startup & Graceful Shutdown
const gracefulShutdown = (
  server: ReturnType<typeof app.listen>,
  signal: string,
) => {
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

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(Env.PORT, () => {
    console.log(
      `Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode.`,
    );
    Logger.info(`Server started successfully`, {
      port: Env.PORT,
      environment: Env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle termination signals
  process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    Logger.error("Uncaught Exception", error, {
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    Logger.error("Unhandled Rejection", reason, {
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  });
};

// In production (Vercel), the app is exported and wrapped as a serverless function.
// app.listen() is NOT called — Vercel handles the HTTP lifecycle.
// In development, startServer() boots a real HTTP server as usual.
if (Env.NODE_ENV !== "production") {
  startServer().catch((error) => {
    Logger.error("Failed to start server", error);
    process.exit(1);
  });
}

// Vercel serverless entry point
export default app;
