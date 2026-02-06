import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTP_STATUS } from "../config/http.config.js";
import type { Request, Response } from "express";
import { registerSchema } from "../validators/auth.validator.js";
import { registerService } from "../services/auth.service.js";

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