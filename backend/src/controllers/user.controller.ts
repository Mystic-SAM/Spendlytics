import {
  findByIdUserService,
  updateUserService,
  updatePasswordService,
} from "../services/user.service.js";
import type { Request, Response } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { updateUserSchema, updatePasswordSchema } from "../validators/user.validator.js";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTP_STATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  },
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateUserSchema.parse(req.body);
    const userId = req.user?._id;

    const user = await updateUserService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "User profile updated successfully",
      data: user,
    });
  },
);

export const updatePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updatePasswordSchema.parse(req.body);
    const userId = req.user?._id;

    await updatePasswordService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Password updated successfully",
    });
  },
);
