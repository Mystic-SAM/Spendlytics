import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginService, registerService, refreshTokenService } from "../services/auth.service.js";
import { Env } from "../config/env.config.js";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "../constants/constants.js";

/**
 * Returns cookie options for the refresh token.
 * - httpOnly: prevents JavaScript access (XSS protection).
 * - secure: only sent over HTTPS in production.
 * - sameSite: "strict" prevents CSRF.
 * - path: scoped to /api/auth so the cookie is only sent on auth requests.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: Env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: `${Env.BASE_PATH}/auth`,
  maxAge: REFRESH_TOKEN_MAX_AGE,
});

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });

    const { user, accessToken, refreshToken, expiresAt, reportSetting } =
      await loginService(body);

    return res
      .status(HTTP_STATUS.OK)
      .cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions())
      .json({
        message: "User logged in successfully",
        user,
        accessToken,
        expiresAt,
        reportSetting,
      });
  });

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const oldToken: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!oldToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Refresh token not provided",
      });
    }

    const { accessToken, refreshToken, expiresAt } =
      await refreshTokenService(oldToken);

    return res
      .status(HTTP_STATUS.OK)
      .cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions())
      .json({
        message: "Token refreshed successfully",
        accessToken,
        expiresAt,
      });
  },
);

export const logoutController = asyncHandler(
  async (_req: Request, res: Response) => {
    return res
      .status(HTTP_STATUS.OK)
      .clearCookie(REFRESH_TOKEN_COOKIE, {
        httpOnly: true,
        secure: Env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: `${Env.BASE_PATH}/auth`,
      })
      .json({
        message: "User logged out successfully",
      });
  },
);