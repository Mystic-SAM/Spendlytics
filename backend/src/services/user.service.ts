import { UserModel } from "../models/user.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";
import type { UpdateUserType } from "../validators/user.validator.js";

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
