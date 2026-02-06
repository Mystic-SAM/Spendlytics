import { type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Middleware to attach a unique request ID to each request.
 * Useful for tracing requests through the application and logging.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check if request ID already exists (from reverse proxy)
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();

  // Store request ID in request object
  req.id = requestId;

  // Add request ID to response headers
  res.setHeader("X-Request-ID", requestId);

  next();
};

// Extend Express Request type to include id property
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
