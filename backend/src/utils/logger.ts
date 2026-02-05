import { Env } from "../config/env.config.js";
import { FileLogger } from "./file-logger.js";

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
   * Format log data as a neatly formatted JSON string
   */
  private static formatLogData(
    level: string,
    message: string,
    metadata?: Record<string, any>,
  ): string {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      ...(this.currentRequestId && { requestId: this.currentRequestId }),
      ...(metadata && { metadata }),
    };
    return JSON.stringify(logObject, null, 2);
  }

  /**
   * Print formatted error to console
   */
  private static printErrorToConsole(
    level: string,
    message: string,
    error?: string | undefined,
  ): void {
    const timestamp = new Date().toISOString();
    const requestIdStr = this.currentRequestId
      ? ` [${this.currentRequestId}]`
      : "";
    const errorStr = error ? `\n  Error: ${error}` : "";

    console.error(
      `\n[${timestamp}] ${level}${requestIdStr}: ${message}${errorStr}`,
    );
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

    const logObject = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      ...(this.currentRequestId && { requestId: this.currentRequestId }),
      ...(errorMessage && { error: errorMessage }),
      ...(stack && { stack }),
      ...(metadata && { metadata }),
    };

    const logData = JSON.stringify(logObject, null, 2);

    // Print to console
    this.printErrorToConsole("ERROR", message, errorMessage);

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
