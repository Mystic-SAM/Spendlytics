import { enIN } from "date-fns/locale";

export const MAX_IMPORT_LIMIT = 300;
export const MAX_TRANSACTIONS_EXPORT_LIMIT = 300;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const MIN_TRANSACTION_DATE = new Date("2026-01-01");

export const OTP_DIGITS = 6;
export const OTP_RESEND_COOLDOWN_SEC = 120; // 2 minutes

export const DATE_LOCALE = enIN;

export const CATEGORIES = [
  { value: "Food", label: "Food" },
  { value: "Groceries", label: "Groceries" },
  { value: "Dining", label: "Dining & Restaurants" },
  { value: "Travel", label: "Travel" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Transportation", label: "Transportation" },
  { value: "Shopping", label: "Shopping" },
  { value: "Housing", label: "Housing & Rent" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Utilities", label: "Utilities" },
  { value: "Recharge", label: "Recharge" },
  { value: "Salary", label: "Salary" },
  { value: "Bonus", label: "Bonus" },
  { value: "Income", label: "Income" },
  { value: "Investment", label: "Investment" },
  { value: "Other", label: "Other" },
];

export const PAYMENT_METHODS_ENUM = {
  UPI: "UPI",
  CASH: "CASH",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER",
} as const;

export const PAYMENT_METHODS = [
  { value: PAYMENT_METHODS_ENUM.UPI, label: "UPI" },
  { value: PAYMENT_METHODS_ENUM.CASH, label: "Cash" },
  { value: PAYMENT_METHODS_ENUM.CARD, label: "Credit/Debit Card" },
  { value: PAYMENT_METHODS_ENUM.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PAYMENT_METHODS_ENUM.OTHER, label: "Other" },
];

export const TRANSACTION_FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;

export const TRANSACTION_FREQUENCY_OPTIONS = [
  { value: TRANSACTION_FREQUENCY.DAILY, label: "Daily" },
  { value: TRANSACTION_FREQUENCY.WEEKLY, label: "Weekly" },
  { value: TRANSACTION_FREQUENCY.MONTHLY, label: "Monthly" },
  { value: TRANSACTION_FREQUENCY.YEARLY, label: "Yearly" },
];

export type TransactionFrequencyType = keyof typeof TRANSACTION_FREQUENCY;

export const TRANSACTION_CATEGORY = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  INVESTMENT: "INVESTMENT",
} as const;

export const TRANSACTION_CATEGORY_OPTIONS = [
  { value: TRANSACTION_CATEGORY.INCOME, label: "Income" },
  { value: TRANSACTION_CATEGORY.EXPENSE, label: "Expense" },
  { value: TRANSACTION_CATEGORY.INVESTMENT, label: "Investment" },
];

export type TransactionCategoryType = keyof typeof TRANSACTION_CATEGORY;

export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type TransactionStatusType = keyof typeof TRANSACTION_STATUS;

export const RECURRING_STATUS = {
  RECURRING: "RECURRING",
  NON_RECURRING: "NON_RECURRING",
} as const;

export type RecurringStatusType = keyof typeof RECURRING_STATUS;

export const REPORT_STATUS = {
  SENT: "SENT",
  FAILED: "FAILED",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  NO_ACTIVITY: "NO_ACTIVITY",
} as const;

export type ReportStatusType = keyof typeof REPORT_STATUS;

export type ThemeType = "dark" | "light" | "system";

export const GITHUB_LOGIN_ENABLED = false;
