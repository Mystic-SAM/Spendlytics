import { Env } from "../config/env.config.js";
import { FileLogger } from "./file-logger.js";

const SEPARATOR: string = "\n" + "-".repeat(80);

/**
 * Logging utility for consistent logging across the application.
 * Provides different log levels with file output.
 * Only errors are printed to console, all logs are written to files in logs/ directory.
 */
export class Logger {
  private static isDevelopment = Env.NODE_ENV === "development";
  private static currentRequestId: string | undefined;

  /**
   * Set the current request ID (typically called from middleware)
   */
  static setRequestId(requestId: string): void {
    this.currentRequestId = requestId;
  }

  /**
   * Clear the current request ID
   */
  static clearRequestId(): void {
    this.currentRequestId = undefined;
  }

  /**
   * Get the current request ID
   */
  static getRequestId(): string | undefined {
    return this.currentRequestId;
  }

  /**
   * Format log data
   */
  private static formatLogData(
    level: string,
    message: string,
    metadata?: Record<string, any>,
  ): string {
    const timestamp = new Date().toISOString();
    const requestIdStr = this.currentRequestId
      ? ` [${this.currentRequestId}]`
      : "";

    let logOutput = `[${timestamp}] ${level}${requestIdStr}: ${message}`;

    // Append metadata if present and has defined values
    if (metadata && Object.keys(metadata).some(key => metadata[key] !== undefined)) {
      logOutput += "\n" + JSON.stringify(metadata, null, 2);
    }

    logOutput += SEPARATOR;

    return logOutput;
  }

  /**
   * Format error log with readable stack trace
   */
  private static formatErrorLog(
    message: string,
    errorMessage?: string,
    stack?: string,
    metadata?: Record<string, any>,
  ): string {
    const timestamp = new Date().toISOString();
    const requestIdStr = this.currentRequestId
      ? ` [${this.currentRequestId}]`
      : "";

    let logOutput = `[${timestamp}] ERROR${requestIdStr}: ${message}`;

    // Append error message if present
    if (errorMessage) {
      logOutput += `\n  Error: ${errorMessage}`;
    }

    // Append metadata if present and has defined values
    if (metadata && Object.keys(metadata).some(key => metadata[key] !== undefined)) {
      logOutput += "\n" + JSON.stringify(metadata, null, 2);
    }

    // Append stack trace in readable format
    if (stack) {
      logOutput += "\nStack Trace:\n" + stack;
    }

    logOutput += SEPARATOR;

    return logOutput;
  }

  /**
   * Log informational messages
   */
  static info(message: string, metadata?: Record<string, any>): void {
    const logData = this.formatLogData("INFO", message, metadata);
    FileLogger.writeToFile(logData);
  }

  /**
   * Log warning messages
   */
  static warn(message: string, metadata?: Record<string, any>): void {
    const logData = this.formatLogData("WARN", message, metadata);
    FileLogger.writeToFile(logData);
  }

  /**
   * Log error messages (console + file)
   */
  static error(
    message: string,
    error?: any,
    metadata?: Record<string, any>,
  ): void {
    const errorObj =
      error instanceof Error
        ? error
        : error
          ? new Error(String(error))
          : undefined;
    const errorMessage = errorObj?.message || error;
    const stack =
      this.isDevelopment && errorObj instanceof Error
        ? errorObj.stack
        : undefined;

    // Format the error log with readable stack trace
    const logData = this.formatErrorLog(message, errorMessage, stack, metadata);

    // Print to console
    const requestIdStr = this.currentRequestId
      ? ` [${this.currentRequestId}]`
      : "";
    const errorStr = errorMessage ? `\n  Error: ${errorMessage}` : "";
    console.error(
      `\n[${new Date().toISOString()}] ERROR${requestIdStr}: ${message}${errorStr}`,
    );
    if (stack) {
      console.error("Stack Trace:\n" + stack);
    }

    // Write to file
    FileLogger.writeToFile(logData);
  }

  /**
   * Log debug messages (file only, development only)
   */
  static debug(message: string, metadata?: Record<string, any>): void {
    if (!this.isDevelopment) return;

    const logData = this.formatLogData("DEBUG", message, metadata);
    FileLogger.writeToFile(logData);
  }

  /**
   * Initialize logger (cleanup old logs)
   */
  static initialize(): void {
    FileLogger.cleanupOldLogs(30);
    this.info("Logger initialized", {
      environment: Env.NODE_ENV,
      logsDirectory: "logs/",
    });
  }
}
