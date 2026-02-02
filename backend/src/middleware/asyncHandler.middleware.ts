import type { Request, Response, NextFunction } from "express";

type AsyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * Wrapper middleware for async route handlers and controllers.
 * Catches any thrown errors and passes them to the error handling middleware.
 * Eliminates the need for try-catch blocks in async controllers.
 *
 * @param controller - Async controller function to wrap
 * @returns Wrapped function that catches errors
 *
 * @example
 * app.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * }));
 */
export const asyncHandler =
  (controller: AsyncControllerType): AsyncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
