import type { Request, Response, NextFunction } from "express";
import { Env } from "../config/env.config.js";
import { UnauthorizedException } from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";

/**
 * Middleware that validates the Authorization header against CRON_SECRET.
 */
export const cronAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // "Bearer <token>"

  if (!token || token !== Env.CRON_SECRET) {
    Logger.warn("Unauthorized cron trigger attempt", {
      ip: req.ip,
      path: req.path,
    });
    throw new UnauthorizedException(
      "Unauthorized: Invalid or missing CRON_SECRET",
    );
  }

  next();
};
