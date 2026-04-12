import { UserModel } from "../models/user.model.js";
import { NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";
import type { UpdateUserType, UpdatePasswordType } from "../validators/user.validator.js";
import { verifyOTP } from "../utils/otp-store.js";

export const findByIdUserService = async (userId: string) => {
  Logger.debug("Fetching user by ID", { userId });
  const user = await UserModel.findById(userId);
  if (!user) {
    Logger.error("User not found by ID", { userId });
    throw new NotFoundException("User not found");
  }
  Logger.debug("User fetched successfully", { userId });
  return user.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
) => {
  Logger.debug("Attempting to update user", {
    userId,
    updates: Object.keys(body),
  });
  const user = await UserModel.findById(userId);
  if (!user) {
    Logger.error("User not found for update", { userId });
    throw new NotFoundException("User not found");
  }

  // If email is being changed, OTP verification is mandatory
  if (body.email && body.email !== user.email) {
    if (!body.otp) {
      throw new UnauthorizedException("OTP is required to update email address.");
    }
    const isOtpValid = verifyOTP(body.email, body.otp);
    if (!isOtpValid) {
      throw new UnauthorizedException("Invalid or expired OTP. Please request a new one.");
    }
  }

  const updateData: Record<string, string> = {};
  if (body.name) updateData.name = body.name;
  if (body.email) updateData.email = body.email;

  user.set(updateData);
  await user.save();

  Logger.info("User updated successfully", {
    userId,
    updatedFields: Object.keys(updateData),
  });
  return user.omitPassword();
};

export const updatePasswordService = async (
  userId: string,
  body: UpdatePasswordType,
) => {
  Logger.debug("Attempting to update password", { userId });

  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    Logger.error("User not found for password update", { userId });
    throw new NotFoundException("User not found");
  }

  const isCurrentPasswordValid = await user.comparePassword(body.currentPassword);
  if (!isCurrentPasswordValid) {
    Logger.warn("Incorrect current password provided", { userId });
    throw new UnauthorizedException("Current password is incorrect");
  }

  user.password = body.newPassword;
  await user.save();

  Logger.info("Password updated successfully", { userId });
};
