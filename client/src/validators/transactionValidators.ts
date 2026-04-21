import { TRANSACTION_FREQUENCY, TRANSACTION_CATEGORY, PAYMENT_METHODS_ENUM } from "@/constants/constants";
import z from "zod";

export const transactionFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  type: z.enum([TRANSACTION_CATEGORY.INCOME, TRANSACTION_CATEGORY.EXPENSE, TRANSACTION_CATEGORY.INVESTMENT]),
  category: z.string().min(1, { message: "Please select a category." }),
  date: z.date({
    error: "Please select a date.",
  }),
  paymentMethod: z.
    enum([
      PAYMENT_METHODS_ENUM.CARD,
      PAYMENT_METHODS_ENUM.BANK_TRANSFER,
      PAYMENT_METHODS_ENUM.UPI,
      PAYMENT_METHODS_ENUM.CASH,
      PAYMENT_METHODS_ENUM.OTHER,
    ], {
      message: "Please select a payment method.",
    }),
  isRecurring: z.boolean(),
  frequency: z
    .enum([
      TRANSACTION_FREQUENCY.DAILY,
      TRANSACTION_FREQUENCY.WEEKLY,
      TRANSACTION_FREQUENCY.MONTHLY,
      TRANSACTION_FREQUENCY.YEARLY,
    ])
    .nullable()
    .optional(),
  description: z.string().optional(),
});

export const importTransactionSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  amount: z.number().positive({ message: "Amount must be greater than zero" }),
  date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date({ message: "Invalid date format" })
  ),
  type: z.enum([TRANSACTION_CATEGORY.INCOME, TRANSACTION_CATEGORY.EXPENSE, TRANSACTION_CATEGORY.INVESTMENT], {
    message: "Invalid transaction type",
  }),
  category: z.string().min(1, { message: "Category is required" }),
  paymentMethod: z.union([
    z.literal(""),
    z.undefined(),
    z.enum([
      PAYMENT_METHODS_ENUM.CARD,
      PAYMENT_METHODS_ENUM.BANK_TRANSFER,
      PAYMENT_METHODS_ENUM.UPI,
      PAYMENT_METHODS_ENUM.CASH,
      PAYMENT_METHODS_ENUM.OTHER,
    ], {
      message: `Payment method must be one of: ${Object.values(PAYMENT_METHODS_ENUM).join(", ")}`,
    })
  ]).transform((val) => (val === "" ? undefined : val)).optional(),
  description: z.string().optional(),
});