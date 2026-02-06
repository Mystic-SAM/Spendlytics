import { addMonths, startOfMonth } from "date-fns";

export function calculateNextReportDate(lastSentDate?: Date): Date {
  const baseDate = lastSentDate ?? new Date();
  return startOfMonth(addMonths(baseDate, 1));
}