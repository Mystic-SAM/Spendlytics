const currentYear = new Date().getFullYear();

/**
 * Generates a styled HTML email template for OTP verification.
 */
export const getOtpEmailTemplate = (otp: string, email: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Verify Your Email – Spendlytics</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #f7f7f7; font-size: 16px;">
      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f7f7; padding: 20px;">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td style="background-color: #00bc7d; padding: 20px 30px; color: #ffffff; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px;">Verify Your Email</h2>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 10px; font-size: 16px;">
                    Hi there,
                  </p>
                  <p style="margin: 0 0 24px; font-size: 16px; color: #555;">
                    We received a request to verify <strong>${email}</strong> on Spendlytics.
                    Use the one-time password (OTP) below to proceed. It is valid for <strong>10 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                    <tr>
                      <td style="text-align: center;">
                        <div style="
                          display: inline-block;
                          background-color: #f0f9f5;
                          border: 2px dashed #00bc7d;
                          border-radius: 10px;
                          padding: 18px 40px;
                          font-size: 36px;
                          font-weight: 700;
                          letter-spacing: 10px;
                          color: #00bc7d;
                        ">${otp}</div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px; font-size: 14px; color: #888;">
                    If you did not request this, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #aaa;">
                    This OTP was generated automatically. Do not reply to this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 12px; color: #999;">
                  &copy; ${currentYear} Spendlytics. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
