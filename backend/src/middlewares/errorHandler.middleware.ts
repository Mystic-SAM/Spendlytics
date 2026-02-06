import type { ErrorRequestHandler, Response } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";
import { Env } from "../config/env.config.js";
import { ErrorCodes } from "../enums/error-code.enum.js";
import { z, ZodError } from "zod";

const formatZodError = (res: Response, error: z.ZodError, requestId: string) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCodes.VALIDATION_ERROR,
    requestId,
  });
};

/**
 * Global error handling middleware.
 * Catches all errors and returns structured error responses.
 * Differentiates between development and production error details.
 */
export const ErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const isDevelopment = Env.NODE_ENV === "development";
  const requestId = req.id;

  // Log the error with request context
  Logger.error("Unhandled error occurred", error, {
    requestId,
    path: req.path,
    method: req.method,
    statusCode:
      error instanceof AppError
        ? error.statusCode
        : HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

  if (error instanceof ZodError) {
    return formatZodError(res, error, requestId);
  }

  // Handle AppError instances
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
      requestId,
      ...(isDevelopment && { statusCode: error.statusCode }),
    });
  }

  // Handle known error types
  if (error instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid JSON in request body",
      errorCode: "INVALID_JSON",
      requestId,
    });
  }

  // Generic internal server error response
  const errorMessage = isDevelopment
    ? error?.message || "Unknown error"
    : "An unexpected error occurred. Internal Server Error.";

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: errorMessage,
    errorCode: "INTERNAL_SERVER_ERROR",
    requestId,
    ...(isDevelopment && { error: error?.message, stack: error?.stack }),
  });
};
