import { enIN } from "date-fns/locale";

/**
 * Global application constants
 */
export const APP_CONSTANTS = {
  /**
   * Date locale for Indian Standard Time (IST)
   */
  DATE_LOCALE: enIN,

  /**
   * IST timezone offset in minutes (UTC +5:30)
   */
  IST_OFFSET_MINUTES: 330,

  /**
   * Session transaction timeout in milliseconds
   */
  SESSION_TIMEOUT_MS: 10000,

  /** Excel MIME type for generated reports */
  EXCEL_MIME_TYPE: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  MAX_TRANSACTIONS_EXPORT_LIMIT: 300,
} as const;

/** Cookie name used for the refresh token. */
export const REFRESH_TOKEN_COOKIE = "refreshToken";

/** 30 days in milliseconds. */
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/** OTP Time To Live in milliseconds. (10 Mins) */
export const OTP_TTL_MS = 10 * 60 * 1000;

/** OTP Max Attempts. */
export const OTP_MAX_ATTEMPTS = 3;

/** OTP Attempt Window in milliseconds. (1 hour) */
export const OTP_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
