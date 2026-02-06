import { UserModel } from "../models/user.model.js";
import type { RegisterSchemaType } from "../validators/auth.validator.js";
import { ConflictException } from "../utils/app-error.js";
import mongoose from "mongoose";
import { ReportSettingModel } from "../models/report-setting.model.js";
import { calculateNextReportDate } from "../utils/helper.js";
import { RecurringIntervalEnum } from "../enums/model-enums.js";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      const [newUser] = await UserModel.create([body], { session });

      if (!newUser) {
        throw new Error("Failed to create user");
      }

      await ReportSettingModel.create([{
        userId: newUser._id,
        frequency: RecurringIntervalEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calculateNextReportDate(),
        lastSentDate: null,
      }], { session });

      return { user: newUser };
    });

    return result;
  } finally {
    await session.endSession();
  }
};