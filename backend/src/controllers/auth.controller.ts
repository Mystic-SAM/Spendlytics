import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import type { Request, Response } from "express";
import { loginSchema, registerSchema, sendOtpSchema } from "../validators/auth.validator.js";
import { loginService, registerService, refreshTokenService } from "../services/auth.service.js";
import { Env } from "../config/env.config.js";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "../constants/constants.js";
import { generateAndStoreOTP } from "../utils/otp-store.js";
import { sendOtpEmail } from "../mailers/otp.mailer.js";
import { Logger } from "../utils/logger.js";

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

/**
 * Generates a 6-digit OTP for the given email, stores it (overwriting any
 * previous OTP to keep only the latest valid), and sends it via Gmail.
 */
export const sendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = sendOtpSchema.parse(req.body);

    const otp = generateAndStoreOTP(email);

    await sendOtpEmail({ email, otp });

    Logger.info("OTP sent", { email });

    return res.status(HTTP_STATUS.OK).json({
      message: "OTP sent successfully. It is valid for 10 minutes.",
    });
  }
);