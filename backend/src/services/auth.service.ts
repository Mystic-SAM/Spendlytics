import { UserModel } from "../models/user.model.js";
import type { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator.js";
import { ConflictException, NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import { verifyOTP } from "../utils/otp-store.js";
import mongoose from "mongoose";
import { ReportSettingModel } from "../models/report-setting.model.js";
import { calculateNextReportDate } from "../utils/helper.js";
import { RecurringIntervalEnum } from "../enums/model-enums.js";
import { signJwtToken, signRefreshToken, verifyJwtToken, type AccessTokenPayload } from "../utils/jwt.js";
import { Logger } from "../utils/logger.js";
import { Env } from "../config/env.config.js";

export const registerService = async (body: RegisterSchemaType) => {
  const { email, otp } = body;
  const session = await mongoose.startSession();

  // Verify OTP before doing anything else (fail fast, no DB transaction needed)
  const isOtpValid = verifyOTP(email, otp);
  if (!isOtpValid) {
    throw new UnauthorizedException("Invalid or expired OTP. Please request a new one.");
  }

  try {
    const result = await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) {
        const errMsg = "Registration failed: User with email already exists";
        Logger.warn(errMsg, { email });
        throw new ConflictException(errMsg);
      }

      const [newUser] = await UserModel.create([body], { session });

      if (!newUser) {
        Logger.error("Registration failed: User creation returned null", { email });
        throw new Error("Failed to create user");
      }

      await ReportSettingModel.create([{
        userId: newUser._id,
        frequency: RecurringIntervalEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calculateNextReportDate(),
        lastSentDate: null,
      }], { session });

      return { user: newUser.omitPassword() };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    const errMsg = "Login failed: User not found";
    Logger.warn(errMsg, { email });
    throw new NotFoundException(errMsg);
  }
  Logger.debug("User found for login attempt", { userId: user.id });
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const errMsg = "Login failed: Invalid email/password";
    Logger.warn(errMsg, { userId: user.id });
    throw new UnauthorizedException(errMsg);
  }

  const { token: accessToken, expiresAt } = signJwtToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
    expiresAt,
    reportSetting,
  };
};

/**
 * Verifies the provided refresh token (JWT), checks the user still exists,
 * and issues a new access token + rotated refresh token.
 */
export const refreshTokenService = async (oldRefreshToken: string) => {
  const payload = verifyJwtToken<AccessTokenPayload>(oldRefreshToken, Env.JWT_REFRESH_SECRET);

  if (!payload) {
    Logger.warn("Refresh token verification failed");
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    Logger.warn("Refresh token used for non-existent user", { userId: payload.userId });
    throw new UnauthorizedException("User not found");
  }

  const { token: accessToken, expiresAt } = signJwtToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  Logger.debug("Token refreshed successfully", { userId: user.id });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  };
};