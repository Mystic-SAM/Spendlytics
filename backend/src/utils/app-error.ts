import { HTTP_STATUS, type HttpStatusCodeType } from "../config/http.config.js";
import { ErrorCodes, type ErrorCodeType } from "../enums/error-code.enum.js";

/**
 * Base application error class for all custom exceptions.
 * Extends Error to provide HTTP status codes and error codes.
 */
export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode: ErrorCodeType | undefined;

  constructor(
    message: string,
    statusCode: HttpStatusCodeType = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeType,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Generic HTTP exception for custom status codes.
 */
export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorCode?: ErrorCodeType,
  ) {
    super(message, statusCode, errorCode);
  }
}

/**
 * 400 Bad Request - Request validation failed.
 */
export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeType) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      errorCode || ErrorCodes.VALIDATION_ERROR,
    );
  }
}

/**
 * 401 Unauthorized - Authentication failed or token invalid.
 */
export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?: ErrorCodeType) {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      errorCode || ErrorCodes.ACCESS_UNAUTHORIZED,
    );
  }
}

/**
 * 403 Forbidden - User authenticated but lacks permission.
 */
export class ForbiddenException extends AppError {
  constructor(
    message = "Forbidden - Access Denied",
    errorCode?: ErrorCodeType,
  ) {
    super(
      message,
      HTTP_STATUS.FORBIDDEN,
      errorCode || ErrorCodes.ACCESS_UNAUTHORIZED,
    );
  }
}

/**
 * 404 Not Found - Resource does not exist.
 */
export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorCode?: ErrorCodeType) {
    super(
      message,
      HTTP_STATUS.NOT_FOUND,
      errorCode || ErrorCodes.RESOURCE_NOT_FOUND,
    );
  }
}

/**
 * 409 Conflict - Resource already exists (duplicate).
 */
export class ConflictException extends AppError {
  constructor(message = "Resource already exists", errorCode?: ErrorCodeType) {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
  }
}

/**
 * 422 Unprocessable Entity - Validation error or malformed request.
 */
export class UnprocessableEntityException extends AppError {
  constructor(message = "Unprocessable Entity", errorCode?: ErrorCodeType) {
    super(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errorCode || ErrorCodes.VALIDATION_ERROR,
    );
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded.
 */
export class TooManyRequestsException extends AppError {
  constructor(message = "Too many requests", errorCode?: ErrorCodeType) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, errorCode);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error.
 */
export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error", errorCode?: ErrorCodeType) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
    );
  }
}
