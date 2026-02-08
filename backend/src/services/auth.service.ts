import { UserModel } from "../models/user.model.js";
import type { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator.js";
import { ConflictException, NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import mongoose from "mongoose";
import { ReportSettingModel } from "../models/report-setting.model.js";
import { calculateNextReportDate } from "../utils/helper.js";
import { RecurringIntervalEnum } from "../enums/model-enums.js";
import { signJwtToken } from "../utils/jwt.js";
import { Logger } from "../utils/logger.js";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const session = await mongoose.startSession();

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

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};