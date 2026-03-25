import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ReportSettingModel } from "../../models/report-setting.model.js";
import type { UserDocument } from "../../models/user.model.js";
import mongoose from "mongoose";
import { generateReportService } from "../../services/report.service.js";
import { ReportStatusEnum } from "../../enums/model-enums.js";
import { calculateNextReportDate, formatDateRange } from "../../utils/helper.js";
import { ReportModel } from "../../models/report.model.js";
import { sendReportEmail } from "../../mailers/report.mailer.js";
import { Logger } from "../../utils/logger.js";
import { APP_CONSTANTS } from "../../constants/constants.js";

/**
 * Type definitions for bulk write operations.
 */
interface BulkInsertOperation {
  insertOne: {
    document: Record<string, any>;
  };
}

interface BulkUpdateOperation {
  updateOne: {
    filter: Record<string, any>;
    update: Record<string, any>;
  };
}

type BulkOperation = BulkInsertOperation | BulkUpdateOperation;

interface JobResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  error?: string;
}

/**
 * Creates a bulk insert operation for a report record.
 */
const createReportInsertOperation = (
  userId: any,
  now: Date,
  period: string,
  status: ReportStatusEnum
): BulkInsertOperation => {
  Logger.debug("Creating report insert operation", { userId, status, period });
  return {
    insertOne: {
      document: {
        userId,
        sentDate: now,
        period,
        status,
        createdAt: now,
        updatedAt: now,
      },
    },
  };
};

/**
 * Creates a bulk update operation for a report setting record.
 */
const createSettingUpdateOperation = (
  settingId: any,
  now: Date,
  lastSentDate: Date | null
): BulkUpdateOperation => {
  Logger.debug("Creating setting update operation", {
    settingId,
    lastSentDate: lastSentDate ? "set" : "null",
  });
  return {
    updateOne: {
      filter: { _id: settingId },
      update: {
        $set: {
          lastSentDate,
          nextReportDate: calculateNextReportDate(now),
          updatedAt: now,
        },
      },
    },
  };
};

/**
 * Attempts to send a report email with error handling.
 * Returns true if email was sent successfully, false otherwise.
 */
const sendReportWithErrorHandling = async (
  user: UserDocument,
  report: any,
  frequency: string
): Promise<boolean> => {
  try {
    Logger.info("Attempting to send report email", {
      userId: user._id.toString(),
      frequency,
    });
    await sendReportEmail({
      email: user.email!,
      username: user.name!,
      report: {
        period: report.period,
        totalIncome: report.summary.income,
        totalExpenses: report.summary.expenses,
        availableBalance: report.summary.balance,
        savingsRate: report.summary.savingsRate,
        topSpendingCategories: report.summary.topCategories,
        insights: report.insights,
      },
      frequency,
    });
    Logger.info("Report email sent successfully", {
      userId: user._id.toString(),
    });
    return true;
  } catch (error) {
    Logger.error("Email failed for user", error, {
      userId: user._id.toString(),
      email: user.email,
    });
    return false;
  }
};

export const processReportJob = async (): Promise<JobResult> => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  // Today july 1, then run report for -> june 1 - 30
  // Get Last Month because this will run on the first of the month
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    Logger.info("Starting report generation job", {
      from: from.toISOString(),
      to: to.toISOString(),
    });

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;
      if (!user) {
        Logger.warn(
          "User not found for report setting",
          { settingId: setting._id }
        );
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user._id.toString(), from, to);

        Logger.debug("Report generated", { userId: user._id.toString() });

        let emailSent = false;
        if (report) {
          emailSent = await sendReportWithErrorHandling(
            user,
            report,
            setting.frequency!
          );
        }

        await session.withTransaction(
          async () => {
            const bulkReports: BulkOperation[] = [];
            const bulkSettings: BulkOperation[] = [];

            if (report && emailSent) {
              bulkReports.push(
                createReportInsertOperation(
                  user._id,
                  now,
                  report.period,
                  ReportStatusEnum.SENT
                )
              );

              bulkSettings.push(
                createSettingUpdateOperation(setting._id, now, now)
              );
            } else {
              const reportPeriod = report?.period ?? formatDateRange(from, to);
              const reportStatus = report
                ? ReportStatusEnum.FAILED
                : ReportStatusEnum.NO_ACTIVITY;

              bulkReports.push(
                createReportInsertOperation(
                  user._id,
                  now,
                  reportPeriod,
                  reportStatus
                )
              );

              bulkSettings.push(
                createSettingUpdateOperation(setting._id, now, null)
              );
            }

            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: APP_CONSTANTS.SESSION_TIMEOUT_MS,
          }
        );

        processedCount++;
      } catch (error) {
        Logger.error("Failed to process report", error, {
          userId: user._id.toString(),
        });
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    Logger.info("Report job completed", {
      processedCount,
      failedCount,
    });

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    Logger.error("Error occurred while processing reports", error);
    return {
      success: false,
      processedCount: 0,
      failedCount: 0,
      error: "Report process failed",
    };
  }
};