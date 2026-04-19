import { DATE_LOCALE } from "@/constants/constants";
import { clsx, type ClassValue } from "clsx"
import { format, isValid, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Safely converts input into a valid Date
 */
function toDate(value: Date | string): Date | null {
  const parsed =
    typeof value === "string" ? parseISO(value) : value;

  return isValid(parsed) ? parsed : null;
}

/**
 * Formats a date into a readable long string
 */
export function formatDateLocalized(date: Date | string, dateFormat: string = "PPP"): string {
  const parsed = toDate(date);
  if (!parsed) return "";

  return format(parsed, dateFormat, { locale: DATE_LOCALE });
}

/**
 * Formats a date into short format (e.g., 20 Jun 2026)
 */
export function formatDateToShort(date: Date | string): string {
  const parsed = toDate(date);
  if (!parsed) return "";

  return format(parsed, "dd MMM yyyy", { locale: DATE_LOCALE });
}

export const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
