import z from "zod";

export const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: passwordSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
});