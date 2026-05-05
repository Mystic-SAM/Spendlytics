import type { ReportType } from "../@types/report.type.js";
import { formatRupeesINR } from "../utils/currency.js";
import { sendEmail, type Params as EmailParams } from "./mailer.js";
import { getReportEmailTemplate } from "./templates/report.template.js";
import { Logger } from "../utils/logger.js";
import { generateExcelFilename } from "../utils/helper.js";
import { APP_CONSTANTS } from "../constants/constants.js";

type ReportEmailParams = {
  email: string;
  username: string;
  report: ReportType;
  frequency: string;
  excelBuffer?: Buffer;
};

/**
 * Sends a financial report email to the user.
 * Optionally includes an Excel attachment with transaction details.
 * Generates both plain text and HTML versions of the report.
 */
export const sendReportEmail = async (
  params: ReportEmailParams,
): Promise<void> => {
  const { email, username, report, frequency, excelBuffer } = params;

  try {
    const html = getReportEmailTemplate(
      {
        username,
        ...report,
      },
      frequency,
    );

    const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatRupeesINR(report.totalIncome)}
    Expenses: ${formatRupeesINR(report.totalExpenses)}
    Investment: ${formatRupeesINR(report.totalInvestment)}
    Balance: ${formatRupeesINR(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

    const emailParams: EmailParams = {
      to: email,
      subject: `${report.period} - ${frequency} Financial Report`,
      text,
      html,
    };

    if (excelBuffer) {
      emailParams.attachments = [
        {
          filename: generateExcelFilename(report.period),
          content: excelBuffer,
          mimeType: APP_CONSTANTS.EXCEL_MIME_TYPE,
        },
      ];
    }

    Logger.debug("Sending report email", {
      email,
      frequency,
      hasAttachment: !!excelBuffer,
      attachmentSizeKB: excelBuffer
        ? (excelBuffer.length / 1024).toFixed(2)
        : undefined,
    });

    await sendEmail(emailParams);

    Logger.info("Report email sent successfully", { email, frequency });
  } catch (error) {
    Logger.error("Failed to send report email", error, { email, frequency });
    throw error;
  }
};
