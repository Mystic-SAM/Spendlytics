/**
 * Centralized enums used across models.
 */

export enum TransactionStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
export type TransactionStatus = keyof typeof TransactionStatusEnum;

export enum RecurringIntervalEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}
export type RecurringInterval = keyof typeof RecurringIntervalEnum;

export enum TransactionTypeEnum {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  INVESTMENT = "INVESTMENT",
}
export type TransactionType = keyof typeof TransactionTypeEnum;

export enum PaymentMethodEnum {
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  UPI = "UPI",
  CASH = "CASH",
  OTHER = "OTHER",
}
export type PaymentMethod = keyof typeof PaymentMethodEnum;

export enum ReportStatusEnum {
  SENT = "SENT",
  PENDING = "PENDING",
  FAILED = "FAILED",
  NO_ACTIVITY = "NO_ACTIVITY",
}
export type ReportStatus = keyof typeof ReportStatusEnum;

export enum ReportFrequencyEnum {
  MONTHLY = "MONTHLY",
}
export type ReportFrequency = keyof typeof ReportFrequencyEnum;

export enum RecurringStatusEnum {
  RECURRING = "RECURRING",
  NON_RECURRING = "NON_RECURRING",
}
export type RecurringStatus = keyof typeof RecurringStatusEnum;
