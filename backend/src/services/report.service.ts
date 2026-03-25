import { ReportModel } from "../models/report.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { ReportSettingModel } from "../models/report-setting.model.js";
import type { UpdateReportSettingType } from "../validators/report.validator.js";
import { calculateNextReportDate, formatDateRange } from "../utils/helper.js";
import { TransactionModel } from "../models/transaction.model.js";
import mongoose from "mongoose";
import { TransactionTypeEnum } from "../enums/model-enums.js";
import { convertToINR } from "../utils/currency.js";
import {
  GEN_AI_MODEL,
  genAI,
  reportInsightAIConfig,
} from "../config/google-ai.config.js";
import { createUserContent } from "@google/genai";
import { reportInsightPrompt } from "../utils/prompts.js";
import { Logger } from "../utils/logger.js";

export const getAllReportsService = async (
  userId: string,
  pagination: {
    pageSize: number;
    pageNumber: number;
  },
) => {
  Logger.debug("getAllReportsService: Fetching reports from database", {
    userId,
    pagination,
  });

  const query: Record<string, any> = { userId };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  Logger.debug("getAllReportsService: Reports retrieved", {
    userId,
    reportsCount: reports.length,
    totalCount,
  });

  return {
    reports,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const updateReportSettingService = async (
  userId: string,
  body: UpdateReportSettingType,
) => {
  const { isEnabled } = body;

  Logger.debug("updateReportSettingService: Updating report setting", {
    userId,
    isEnabled,
  });

  let nextReportDate: Date | null = null;

  const existingReportSetting = await ReportSettingModel.findOne({
    userId,
  });
  if (!existingReportSetting)
    throw new NotFoundException("Report setting not found");

  if (isEnabled) {
    const currentNextReportDate = existingReportSetting.nextReportDate;
    const now = new Date();
    if (!currentNextReportDate || currentNextReportDate <= now) {
      nextReportDate = calculateNextReportDate(
        existingReportSetting.lastSentDate ?? undefined,
      );
      Logger.debug("updateReportSettingService: Calculated next report date", {
        userId,
        nextReportDate: nextReportDate?.toISOString(),
      });
    } else {
      nextReportDate = currentNextReportDate;
    }
  }

  existingReportSetting.set({
    ...body,
    nextReportDate,
  });

  await existingReportSetting.save();

  Logger.info(
    "updateReportSettingService: Report setting updated successfully",
    {
      userId,
      isEnabled,
      nextReportDate: nextReportDate?.toISOString(),
    },
  );
};

export const generateReportService = async (
  userId: string,
  fromDate: Date,
  toDate: Date,
) => {
  Logger.debug("generateReportService: Starting report generation", {
    userId,
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
  });

  const startTime = Date.now();

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.INCOME] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },

              totalExpenses: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },

              totalInvestement: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.INVESTMENT] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
            },
          },
        ],

        categories: [
          {
            $match: { type: TransactionTypeEnum.EXPENSE },
          },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $abs: "$amount" } },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        totalIncome: {
          $arrayElemAt: ["$summary.totalIncome", 0],
        },
        totalExpenses: {
          $arrayElemAt: ["$summary.totalExpenses", 0],
        },
        totalInvestement: {
          $arrayElemAt: ["$summary.totalInvestement", 0],
        },
        categories: 1,
      },
    },
  ]);

  if (
    !results?.length ||
    (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0)
  ) {
    Logger.info("generateReportService: No transactions found for period", {
      userId,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });
    return null;
  }

  const {
    totalIncome = 0,
    totalExpenses = 0,
    totalInvestement = 0,
    categories = [],
  } = results[0] || {};

  Logger.debug("generateReportService: Aggregation completed", {
    userId,
    totalIncome,
    totalExpenses,
    totalInvestement,
    categoriesCount: categories.length,
  });

  const byCategory = categories.reduce(
    (
      acc: Record<string, { amount: number; percentage: number }>,
      { _id, total }: any,
    ) => {
      acc[_id] = {
        amount: convertToINR(total),
        percentage:
          totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      };
      return acc;
    },
    {} as Record<string, { amount: number; percentage: number }>,
  );

  const availableBalance = totalIncome - (totalExpenses + totalInvestement);
  const savingsRate = calculateSavingRate(
    totalIncome,
    totalExpenses,
    totalInvestement,
  );

  const periodLabel = formatDateRange(fromDate, toDate);

  const aiStartTime = Date.now();
  const insights = await generateInsightsAI({
    totalIncome,
    totalExpenses,
    totalInvestement,
    availableBalance,
    savingsRate,
    categories: byCategory,
    periodLabel,
  });
  const aiDuration = Date.now() - aiStartTime;

  const totalDuration = Date.now() - startTime;

  Logger.info("generateReportService: Report generated successfully", {
    userId,
    totalIncome: convertToINR(totalIncome),
    totalExpenses: convertToINR(totalExpenses),
    savingsRate,
    categoriesCount: Object.keys(byCategory).length,
    aiDuration: `${aiDuration}ms`,
    totalDuration: `${totalDuration}ms`,
  });

  return {
    period: periodLabel,
    summary: {
      income: convertToINR(totalIncome),
      expenses: convertToINR(totalExpenses),
      balance: convertToINR(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      topCategories: Object.entries(byCategory)?.map(([name, cat]: any) => ({
        name,
        amount: cat.amount,
        percent: cat.percentage,
      })),
    },
    insights,
  };
};

async function generateInsightsAI({
  totalIncome,
  totalExpenses,
  totalInvestement,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  totalInvestement: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) {
  try {
    Logger.debug("generateInsightsAI: Starting AI insight generation", {
      periodLabel,
    });

    const aiStartTime = Date.now();

    const prompt = reportInsightPrompt({
      totalIncome: convertToINR(totalIncome),
      totalExpenses: convertToINR(totalExpenses),
      totalInvestement: convertToINR(totalInvestement),
      availableBalance: convertToINR(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      categories,
      periodLabel,
    });

    const result = await genAI.models.generateContent({
      model: GEN_AI_MODEL,
      contents: [createUserContent([prompt])],
      config: reportInsightAIConfig,
    });

    Logger.debug("generateInsightsAI: AI response received", {
      periodLabel,
      responseLength: result.text?.length || 0,
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) {
      Logger.warn("generateInsightsAI: Empty response from AI model", {
        periodLabel,
      });
      return [];
    }

    const data = JSON.parse(cleanedText);

    const aiDuration = Date.now() - aiStartTime;
    Logger.info("generateInsightsAI: Insights generated successfully", {
      periodLabel,
      insightsCount: Array.isArray(data) ? data.length : 0,
      duration: `${aiDuration}ms`,
    });

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(
      "generateInsightsAI: Error occurred while generating insights",
      {
        periodLabel,
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    );
    return [];
  }
}

function calculateSavingRate(
  totalIncome: number,
  totalExpenses: number,
  totalInvestement: number,
) {
  if (totalIncome <= 0) return 0;
  const savingRate =
    ((totalIncome - (totalExpenses + totalInvestement)) / totalIncome) * 100;
  return parseFloat(savingRate.toFixed(2));
}
