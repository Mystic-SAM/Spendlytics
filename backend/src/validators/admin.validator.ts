import { z } from "zod";

export const getAllUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().int().min(1).optional()
  ),
  limit: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().int().min(1).max(100).optional()
  ),
});

export const deleteUserParamsSchema = z.object({
  id: z.string().trim().min(1, "User ID is required"),
});

export type GetAllUsersQueryType = z.infer<typeof getAllUsersQuerySchema>;
export type DeleteUserParamsType = z.infer<typeof deleteUserParamsSchema>;
