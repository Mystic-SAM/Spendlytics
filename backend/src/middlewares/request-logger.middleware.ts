import { type Request, type Response, type NextFunction } from "express";
import { Logger } from "../utils/logger.js";

/**
 * Middleware to log incoming requests and outgoing responses.
 * Tracks request method, path, status, and response time.
 * Sets request ID in Logger for all subsequent logs.
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Set request ID in Logger for all subsequent logs in this request
  Logger.setRequestId(req.id);

  const startTime = Date.now();
  const { method, path, query, body } = req;

  // Log incoming request
  Logger.info(`[${method}] ${path}`, {
    query: Object.keys(query).length > 0 ? query : undefined,
    bodyKeys:
      body && Object.keys(body).length > 0 ? Object.keys(body) : undefined,
  });

  // Intercept response end to log response details
  const originalEnd = res.end;
  type EndArgs = Parameters<typeof res.end>;

  (res as any).end = function (
    this: Response,
    ...args: EndArgs
  ): ReturnType<typeof res.end> {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    Logger.info(`[${method}] ${path} - ${statusCode}`, {
      statusCode,
      duration: `${duration}ms`,
    });

    // Clear request ID after response
    Logger.clearRequestId();

    // Call original end method with the exact arguments received and return its result
    return originalEnd.apply(this as any, args) as ReturnType<typeof res.end>;
  };

  next();
};
