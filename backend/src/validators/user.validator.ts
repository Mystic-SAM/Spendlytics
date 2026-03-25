import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z.email("Invalid email format").trim().toLowerCase().optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one field (name or email) must be provided for update",
  });

export type UpdateUserType = z.infer<typeof updateUserSchema>;
