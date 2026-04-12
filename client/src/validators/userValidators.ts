import z from "zod";
import { passwordSchema } from "./authValidators";

export const accountFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(255, { message: "Name must be at most 255 characters." })
      .optional(),
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one field (name or email) must be provided for update",
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });