import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import {
  getAllUsersService,
  deleteUserService,
} from "../services/admin.service.js";
import {
  getAllUsersQuerySchema,
  deleteUserParamsSchema,
} from "../validators/admin.validator.js";

export const getAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {

    const queryParams = getAllUsersQuerySchema.parse(req.query);

    const result = await getAllUsersService(queryParams);

    return res.status(HTTP_STATUS.OK).json({
      message: "Users fetched successfully",
      ...result,
    });
  },
);

/**
 * Permanently deletes a user and ALL their associated data.
 *
 * Refused if:
 *   1. The requesting super admin tries to delete themselves.
 *   2. The target user is also a super admin.
 */
export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: targetUserId } = deleteUserParamsSchema.parse(req.params);
    const requestingUserId = String(req.user?._id);

    const result = await deleteUserService(targetUserId, requestingUserId);

    return res.status(HTTP_STATUS.OK).json({
      message: `User ${result.email} and all associated data deleted successfully.`,
      deletedUserId: result.deletedUserId,
    });
  },
);
