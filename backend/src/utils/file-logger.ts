import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File logging utility for managing log files.
 * Creates a logs directory and daily log files automatically.
 */
export class FileLogger {
  private static readonly logsDir = path.join(__dirname, "../../logs");
  private static readonly maxRetries = 5;

  /**
   * Ensure logs directory exists
   */
  static ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      try {
        fs.mkdirSync(this.logsDir, { recursive: true });
      } catch (error) {
        console.error("Failed to create logs directory:", error);
      }
    }
  }

  /**
   * Get log file path for today
   */
  static getLogFilePath(): string {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(this.logsDir, `${dateString}.log`);
  }

  /**
   * Write log entry to file with retry logic
   */
  static writeToFile(logEntry: string, retries = 0): void {
    try {
      this.ensureLogsDirectory();
      const logFilePath = this.getLogFilePath();

      // Append to file, create if doesn't exist
      fs.appendFileSync(logFilePath, logEntry + "\n", "utf-8");
    } catch (error) {
      if (retries < this.maxRetries) {
        // Retry after a short delay
        setTimeout(() => this.writeToFile(logEntry, retries + 1), 100);
      } else {
        console.error("Failed to write to log file after retries:", error);
      }
    }
  }

  /**
   * Clean up old log files (older than 30 days)
   */
  static cleanupOldLogs(daysToKeep = 30): void {
    try {
      this.ensureLogsDirectory();
      const files = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const thirtyDaysInMs = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > thirtyDaysInMs) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error("Failed to cleanup old logs:", error);
    }
  }
}
