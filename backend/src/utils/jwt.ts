import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { Env } from "../config/env.config.js";
import { Logger } from "../utils/logger.js";

type TimeUnit = "s" | "m" | "h" | "d" | "w" | "y";
type TimeString = `${number}${TimeUnit}`;

export type AccessTokenPayload = {
  userId: string;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
  expiresIn?: TimeString | number;
};

const defaults: SignOptions = {
  audience: ["user"],
};

const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_EXPIRES_IN as TimeString,
  secret: Env.JWT_SECRET,
};

const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_REFRESH_EXPIRES_IN as TimeString,
  secret: Env.JWT_REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTokenPayload,
  options?: SignOptsAndSecret
) => {
  const isAccessToken = !options || options === accessTokenSignOptions;

  const { secret, ...opts } = options || accessTokenSignOptions;

  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

  let expiresAt: number | undefined;
  if (isAccessToken) {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (decoded?.exp) {
      expiresAt = decoded.exp * 1000;
    } else {
      Logger.warn("JWT token decoded without exp claim", { userId: payload.userId });
    }
  }

  return {
    token,
    expiresAt,
  };
};

/**
 * Signs a refresh token with the dedicated refresh secret and expiry.
 */
export const signRefreshToken = (payload: AccessTokenPayload): string => {
  const { token } = signJwtToken(payload, refreshTokenSignOptions);
  return token;
};

/**
 * Verifies a JWT token against the given secret.
 * Returns the decoded payload on success, or null on failure (expired, tampered, etc.).
 */
export const verifyJwtToken = <T extends object>(
  token: string,
  secret: string,
): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};