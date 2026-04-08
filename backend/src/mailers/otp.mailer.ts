import { sendEmail } from "./mailer.js";
import { getOtpEmailTemplate } from "./templates/otp.template.js";
import { Logger } from "../utils/logger.js";

type OtpEmailParams = {
  email: string;
  otp: string;
};

/**
 * Sends an OTP verification email to the given address.
 */
export const sendOtpEmail = async ({ email, otp }: OtpEmailParams): Promise<void> => {
  try {
    const html = getOtpEmailTemplate(otp, email);
    const text = `Your Spendlytics verification OTP is: ${otp}\nThis OTP is valid for 10 minutes. Do not share it with anyone.`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email - Spendlytics",
      text,
      html,
    });

    Logger.info("OTP email sent successfully", { email });
  } catch (error) {
    Logger.error("Failed to send OTP email", error, { email });
    throw error;
  }
};
