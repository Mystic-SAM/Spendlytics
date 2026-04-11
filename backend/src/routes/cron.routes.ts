import { Router } from "express";
import type { Request, Response } from "express";
import { HTTP_STATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { processRecurringTransactions } from "../crons/jobs/transaction.job.js";
import { processReportJob } from "../crons/jobs/report.job.js";
import { Logger } from "../utils/logger.js";

const cronRoutes = Router();

/**
 * GET /api/crons/transactions
 * Triggered daily at 00:05 IST by Vercel Cron.
 * Processes all recurring transactions for the day.
 */
cronRoutes.get(
  "/transactions",
  asyncHandler(async (_req: Request, res: Response) => {
    Logger.info("Cron triggered: processRecurringTransactions");
    await processRecurringTransactions();
    res.status(HTTP_STATUS.OK).json({ success: true, job: "transactions" });
  }),
);

/**
 * GET /api/crons/reports
 * Triggered at 02:30 IST on the 1st of every month by Vercel Cron.
 * Generates and emails monthly reports for all opted-in users.
 */
cronRoutes.get(
  "/reports",
  asyncHandler(async (_req: Request, res: Response) => {
    Logger.info("Cron triggered: processReportJob");
    await processReportJob();
    res.status(HTTP_STATUS.OK).json({ success: true, job: "reports" });
  }),
);

export default cronRoutes;
