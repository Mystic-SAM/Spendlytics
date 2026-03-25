import type { PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { TransactionTypeEnum } from "../enums/model-enums.js";
import type { DateRangePreset } from "../enums/date-range.enum.js";
import { DateRangeEnum } from "../enums/date-range.enum.js";
import { Logger } from "./logger.js";

/**
 * Build a MongoDB filter for date range queries
 */
export const buildDateRangeFilter = (
  userId: string,
  from: Date | null,
  to: Date | null,
  transactionType?: TransactionTypeEnum,
): Record<string, any> => {
  const filter: Record<string, any> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (transactionType) {
    filter.type = transactionType;
  }

  if (from && to) {
    filter.date = {
      $gte: from,
      $lte: to,
    };
  }

  return filter;
};

/**
 * Create aggregation stages for summing transaction amounts by type
 */
export const createTransactionTypeSumStages = (): Record<string, any> => {
  return {
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
    totalInvestment: {
      $sum: {
        $cond: [
          { $eq: ["$type", TransactionTypeEnum.INVESTMENT] },
          { $abs: "$amount" },
          0,
        ],
      },
    },
  };
};

/**
 * Build preset metadata object with consistency across services
 */
export const buildPresetObject = (
  range: {
    from: Date | null;
    to: Date | null;
    value: DateRangePreset;
    label?: string;
  },
  fallbackValue: DateRangePreset = DateRangeEnum.ALL_TIME,
  fallbackLabel: string = "All Time",
) => {
  return {
    from: range.from,
    to: range.to,
    value: range.value || fallbackValue,
    label: range.label || fallbackLabel,
  };
};

/**
 * Calculate percentage change between two values
 * Handles zero values gracefully
 * Caps results between -100 and 100
 */
export const calculatePercentageChange = (
  previous: number,
  current: number,
): number => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  const percentageChange = ((current - previous) / Math.abs(previous)) * 100;
  const cappedChange = Math.min(Math.max(percentageChange, -100), 100);

  return parseFloat(cappedChange.toFixed(2));
};

/**
 * Determine if a date range is yearly for previous period calculation
 */
export const isYearlyDateRange = (
  rangeValue: DateRangePreset | undefined,
): boolean => {
  if (!rangeValue) return false;
  return (
    rangeValue === DateRangeEnum.LAST_YEAR ||
    rangeValue === DateRangeEnum.THIS_YEAR
  );
};

/**
 * Extract aggregation result with default values
 */
export const extractAggregationResult = (
  data: Record<string, any> | undefined,
  defaults: Record<string, any> = {},
): Record<string, any> => {
  return {
    totalIncome: data?.totalIncome ?? defaults.totalIncome ?? 0,
    totalExpenses: data?.totalExpenses ?? defaults.totalExpenses ?? 0,
    totalInvestment: data?.totalInvestment ?? defaults.totalInvestment ?? 0,
    availableBalance: data?.availableBalance ?? defaults.availableBalance ?? 0,
    transactionCount: data?.transactionCount ?? defaults.transactionCount ?? 0,
    savingData: data?.savingData ??
      defaults.savingData ?? {
        expenseRatio: 0,
        savingsPercentage: 0,
      },
  };
};

/**
 * Format and log aggregation results
 */
export const logAggregationResult = (
  stageName: string,
  resultLength: number,
  metadata?: Record<string, any>,
): void => {
  Logger.info(`Aggregation pipeline completed`, {
    stage: stageName,
    resultCount: resultLength,
    ...metadata,
  });
};
