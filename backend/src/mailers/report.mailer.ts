import type { ReportType } from "../@types/report.type.js";
import { formatCurrencyINR } from "../utils/currency.js";
import { sendEmail } from "./mailer.js";
import { getReportEmailTemplate } from "./templates/report.template.js";
import { Logger } from "../utils/logger.js";

type ReportEmailParams = {
  email: string;
  username: string;
  report: ReportType;
  frequency: string;
};

/**
 * Sends a financial report email to the user.
 * Generates both plain text and HTML versions of the report.
 */
export const sendReportEmail = async (
  params: ReportEmailParams,
): Promise<void> => {
  const { email, username, report, frequency } = params;

  try {
    const html = getReportEmailTemplate(
      {
        username,
        ...report,
      },
      frequency,
    );

    const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrencyINR(report.totalIncome)}
    Expenses: ${formatCurrencyINR(report.totalExpenses)}
    Balance: ${formatCurrencyINR(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

    await sendEmail({
      to: email,
      subject: `${frequency} Financial Report - ${report.period}`,
      text,
      html,
    });

    Logger.info("Report email sent successfully", { email, frequency });
  } catch (error) {
    Logger.error("Failed to send report email", error, { email, frequency });
    throw error;
  }
};
