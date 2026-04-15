import { addDays, addMonths, addWeeks, addYears, startOfMonth } from "date-fns";
import {
  RecurringIntervalEnum,
  type RecurringInterval,
} from "../enums/model-enums.js";
import { format } from "date-fns";
import { APP_CONSTANTS } from "../constants/constants.js";

/**
 * Sets a date to midnight in IST (Indian Standard Time, UTC +5:30).
 * @param date - The date to adjust
 * @returns The date adjusted to IST midnight
 */
function setToISTMidnight(date: Date): Date {
  const istDate = new Date(
    date.getTime() + APP_CONSTANTS.IST_OFFSET_MINUTES * 60 * 1000,
  );
  istDate.setUTCHours(0, 0, 0, 0);
  return istDate;
}

/**
 * Formats a date range into a readable string using Indian locale.
 * @param from - Start date
 * @param to - End date
 * @returns Formatted date range string
 */
export function formatDateRange(from: Date, to: Date): string {
  const formatted = `${format(from, "PPP", { locale: APP_CONSTANTS.DATE_LOCALE })} - ${format(to, "PPP", { locale: APP_CONSTANTS.DATE_LOCALE })}`;
  return formatted;
}

/**
 * Calculates the next report date from the last sent date.
 * Defaults to first day of next month at IST midnight.
 * @param lastSentDate - The date the last report was sent
 * @returns The next report date
 */
export function calculateNextReportDate(lastSentDate?: Date): Date {
  const baseDate = lastSentDate ?? new Date();
  const nextDate = startOfMonth(addMonths(baseDate, 1));
  return setToISTMidnight(nextDate);
}

/**
 * Calculates the next occurrence date based on the recurring interval.
 * Always resets time to IST midnight.
 * @param date - The base date
 * @param recurringInterval - The recurring interval enum
 * @returns The next occurrence date
 */
export function calculateNextOccurrence(
  date: Date,
  recurringInterval: RecurringInterval,
): Date {
  const base = new Date(date);
  let nextDate: Date;

  switch (recurringInterval) {
    case RecurringIntervalEnum.DAILY:
      nextDate = addDays(base, 1);
      break;
    case RecurringIntervalEnum.WEEKLY:
      nextDate = addWeeks(base, 1);
      break;
    case RecurringIntervalEnum.MONTHLY:
      nextDate = addMonths(base, 1);
      break;
    case RecurringIntervalEnum.YEARLY:
      nextDate = addYears(base, 1);
      break;
    default:
      nextDate = base;
  }

  return setToISTMidnight(nextDate);
}

/**
 * Calculates the next effective date ensuring it's not in the past.
 * If the calculated date is in the past, calculates from current date instead.
 * @param startDate - The start date
 * @param interval - The recurring interval
 * @returns The next effective date
 */
export function calculateNextEffectiveDate(
  startDate: Date,
  interval: RecurringInterval,
): Date {
  const now = new Date();
  const calculatedDate = calculateNextOccurrence(startDate, interval);

  const nextRecurringDate =
    calculatedDate < now
      ? calculateNextOccurrence(now, interval)
      : calculatedDate;

  return nextRecurringDate;
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * Handles empty strings safely.
 * @param string - The input string
 * @returns The capitalized string
 */
export function capitalizeFirstLetter(string: string): string {
  if (!string || string.length === 0) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Generates a sanitized filename for the report Excel file
 */
export const generateExcelFilename = (period: string): string => {
  return `Financial Report ${period}.xlsx`;
};
