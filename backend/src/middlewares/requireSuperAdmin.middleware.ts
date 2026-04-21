import type { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../utils/app-error.js";
import type { UserDocument } from "../models/user.model.js";

/**
 * Middleware that enforces super-admin access.
 *
 * Must be placed AFTER `passportAuthenticateJwt` so that `req.user` is
 * already populated. Rejects any request where the authenticated user does
 * not have the `isSuperAdmin` flag set to `true` in the database.
 */
export const requireSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const user = req.user as UserDocument | undefined;
  if (!user?.isSuperAdmin) {
    throw new ForbiddenException(
      "Access denied: Super admin privileges required.",
    );
  }
  next();
};
