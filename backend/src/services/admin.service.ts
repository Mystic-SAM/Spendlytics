import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { ReportModel } from "../models/report.model.js";
import { ReportSettingModel } from "../models/report-setting.model.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";
import { escapeRegexChars } from "../utils/helper.js";
import type { GetAllUsersQueryType } from "../validators/admin.validator.js";

/**
 * Returns a paginated, optionally-filtered list of all registered users.
 * The `search` parameter performs a case-insensitive match against both
 * `name` and `email`. Password is never returned.
 */
export const getAllUsersService = async (query: GetAllUsersQueryType) => {
  const { search = "", page = 1, limit = 15 } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {};

  if (search) {
    const escapedSearch = escapeRegexChars(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  Logger.info("Fetching all users", { search, page: pageNum, limit: limitNum });

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("name email profilePicture isSuperAdmin createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  Logger.info("Users fetched", { total, returned: users.length });

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Permanently deletes a user and ALL data associated with them:
 *   - Transactions
 *   - Reports
 *   - Report Settings
 *   - User document
 *
 * Guard rails:
 *   1. A super admin cannot delete themselves.
 *   2. A super admin cannot delete another super admin.
 *
 * Runs inside a MongoDB session transaction to guarantee atomicity.
 */
export const deleteUserService = async (
  targetUserId: string,
  requestingUserId: string,
) => {
  if (targetUserId === requestingUserId) {
    throw new BadRequestException("You cannot delete your own account.");
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new BadRequestException("Invalid user ID.");
  }

  const targetUser = await UserModel.findById(targetUserId).select(
    "name email isSuperAdmin",
  );

  if (!targetUser) {
    throw new NotFoundException("User not found.");
  }

  if (targetUser.isSuperAdmin) {
    throw new ForbiddenException(
      "Super admin accounts cannot be deleted through this interface.",
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Promise.all([
        TransactionModel.deleteMany({ userId: targetUserId }, { session }),
        ReportModel.deleteMany({ userId: targetUserId }, { session }),
        ReportSettingModel.deleteMany({ userId: targetUserId }, { session }),
      ]);

      await UserModel.findByIdAndDelete(targetUserId, { session });
    });

    Logger.info("User and all associated data deleted by super admin", {
      targetUserId,
      targetEmail: targetUser.email,
      requestingUserId,
    });

    return { deletedUserId: targetUserId, email: targetUser.email };
  } finally {
    await session.endSession();
  }
};
