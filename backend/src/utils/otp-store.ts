import { OTP_ATTEMPT_WINDOW_MS, OTP_MAX_ATTEMPTS, OTP_TTL_MS } from "../constants/constants.js";
import { Logger } from "./logger.js";
import { TooManyRequestsException } from "./app-error.js";

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();
const otpAttemptsMap = new Map<string, { count: number; firstAttemptAt: number }>();

/**
 * Generates a random 6-digit OTP, stores it for the given email
 * (overwriting any previous OTP, making the old one invalid),
 * and returns the generated OTP string.
 */
export const generateAndStoreOTP = (email: string): string => {
  const now = Date.now();
  const attemptRecord = otpAttemptsMap.get(email);

  if (attemptRecord) {
    if (now - attemptRecord.firstAttemptAt > OTP_ATTEMPT_WINDOW_MS) {
      otpAttemptsMap.set(email, { count: 1, firstAttemptAt: now });
    } else {
      if (attemptRecord.count >= OTP_MAX_ATTEMPTS) {
        Logger.warn("OTP generation failed: max attempts reached", { email });
        throw new TooManyRequestsException("Maximum OTP send attempts reached for this email. Please try different email or try again later.");
      }
      attemptRecord.count += 1;
      otpAttemptsMap.set(email, attemptRecord);
    }
  } else {
    otpAttemptsMap.set(email, { count: 1, firstAttemptAt: now });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + OTP_TTL_MS;

  otpStore.set(email, { otp, expiresAt });

  Logger.debug("OTP generated and stored", { email, expiresAt: new Date(expiresAt).toISOString() });
  return otp;
};

/**
 * Verifies the OTP for a given email.
 * - Deletes the entry if expired (prevents stale memory).
 * - Deletes the entry on a successful match (single-use).
 * Returns true only when the OTP matches and has not expired.
 */
export const verifyOTP = (email: string, otp: string): boolean => {
  const entry = otpStore.get(email);

  if (!entry) {
    Logger.warn("OTP verification failed: No OTP found for email", { email });
    return false;
  }

  // Always clean up expired entries
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    Logger.warn("OTP verification failed: OTP expired", { email });
    return false;
  }

  if (entry.otp !== otp) {
    Logger.warn("OTP verification failed: Incorrect OTP", { email });
    return false;
  }

  // Valid — delete after successful use (single-use)
  otpStore.delete(email);
  otpAttemptsMap.delete(email);
  Logger.debug("OTP verified and consumed", { email });
  return true;
};
