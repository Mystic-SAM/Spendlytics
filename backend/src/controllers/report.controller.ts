import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service.js";
import { HTTP_STATUS } from "../config/http.config.js";
import { updateReportSettingSchema } from "../validators/report.validator.js";
import { BadRequestException } from "../utils/app-error.js";
import { Logger } from "../utils/logger.js";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 1;

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    Logger.debug("getAllReportsController: Fetching reports", { userId });

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE,
      pageNumber:
        parseInt(req.query.pageNumber as string) || DEFAULT_PAGE_NUMBER,
    };

    const result = await getAllReportsService(userId, pagination);

    Logger.info("getAllReportsController: Reports fetched successfully", {
      userId,
      count: result.reports.length,
      totalCount: result.pagination.totalCount,
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  },
);

export const updateReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    Logger.debug("updateReportSettingController: Updating report setting", {
      userId,
      body: req.body,
    });

    const body = updateReportSettingSchema.parse(req.body);
    await updateReportSettingService(userId, body);

    Logger.info("updateReportSettingController: Report setting updated", {
      userId,
      isEnabled: body.isEnabled,
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  },
);

export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to } = req.query;

    if (!from || !to) {
      Logger.warn("generateReportController: Missing date parameters", {
        from,
        to,
      });
      throw new BadRequestException(
        "Both 'from' and 'to' date parameters are required in ISO 8601 format (e.g., 2026-01-01T00:00:00)",
      );
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      Logger.warn("generateReportController: Invalid date format provided", {
        from,
        to,
      });
      throw new BadRequestException(
        "Invalid date format. Please use ISO 8601 format (e.g., 2026-01-01T00:00:00)",
      );
    }

    // Validate date range
    if (fromDate >= toDate) {
      Logger.warn("generateReportController: Invalid date range", {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
      throw new BadRequestException("'from' date must be before 'to' date");
    }

    Logger.debug("generateReportController: Generating report", {
      userId,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });

    const startTime = Date.now();
    const result = await generateReportService(userId, fromDate, toDate);
    const duration = Date.now() - startTime;

    Logger.info("generateReportController: Report generated successfully", {
      userId,
      duration: `${duration}ms`,
      hasInsights: !!result?.insights,
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Report generated successfully",
      ...result,
    });
  },
);
