import type { PipelineStage } from "mongoose";
import {
  DateRangeEnum,
  type DateRangePreset,
} from "../enums/date-range.enum.js";
import { TransactionTypeEnum } from "../enums/model-enums.js";
import { TransactionModel } from "../models/transaction.model.js";
import { convertToINR } from "../utils/currency.js";
import { differenceInDays, subDays, subYears } from "date-fns";
import { getDateRange } from "../utils/date.js";
import { Logger } from "../utils/logger.js";
import {
  buildDateRangeFilter,
  buildPresetObject,
  calculatePercentageChange,
  createTransactionTypeSumStages,
  extractAggregationResult,
  isYearlyDateRange,
  logAggregationResult,
} from "../utils/analytics.utils.js";

/**
 * Helper: Get current period summary statistics
 */
const getCurrentPeriodSummary = async (
  userId: string,
  from: Date | null,
  to: Date | null,
): Promise<Record<string, any> | undefined> => {
  const filter = buildDateRangeFilter(userId, from, to);

  const currentPeriodPipeline: PipelineStage[] = [
    { $match: filter },
    {
      $group: {
        _id: null,
        ...createTransactionTypeSumStages(),
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        totalInvestment: 1,
        transactionCount: 1,

        // Available Balance = income - (expenses + investment)
        availableBalance: {
          $subtract: [
            { $ifNull: ["$totalIncome", 0] },
            {
              $add: [
                { $ifNull: ["$totalExpenses", 0] },
                { $ifNull: ["$totalInvestment", 0] },
              ],
            },
          ],
        },

        savingData: {
          $let: {
            vars: {
              income: { $ifNull: ["$totalIncome", 0] },
              expenses: { $ifNull: ["$totalExpenses", 0] },
              investment: { $ifNull: ["$totalInvestment", 0] },
            },
            in: {
              // Savings Percentage = ((income - (expenses + investment)) / income) * 100
              savingsPercentage: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $subtract: [
                              "$$income",
                              { $add: ["$$expenses", "$$investment"] },
                            ],
                          },
                          "$$income",
                        ],
                      },
                      100,
                    ],
                  },
                ],
              },

              // Expense Ratio = (expenses / income) * 100
              expenseRatio: {
                $cond: [
                  { $lte: ["$$income", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: ["$$expenses", "$$income"],
                      },
                      100,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];

  const [current] = await TransactionModel.aggregate(currentPeriodPipeline);
  return current;
};

/**
 * Helper: Calculate period-over-period comparison
 */
const calculatePeriodComparison = async (
  userId: string,
  from: Date | null,
  to: Date | null,
  rangeValue: DateRangePreset,
  currentPeriodValues: {
    totalIncome: number;
    totalExpenses: number;
    totalInvestment: number;
    availableBalance: number;
  },
): Promise<Record<string, any>> => {
  const defaultResult = {
    income: 0,
    expenses: 0,
    investment: 0,
    balance: 0,
    prevPeriodFrom: null,
    prevPeriodTo: null,
    previousValues: {
      incomeAmount: 0,
      expenseAmount: 0,
      investmentAmount: 0,
      balanceAmount: 0,
    },
  };

  if (!from || !to || rangeValue === DateRangeEnum.ALL_TIME) {
    Logger.debug("Skipping period comparison for ALL_TIME or missing dates");
    return defaultResult;
  }

  const period = differenceInDays(to, from) + 1;
  const isYearly = isYearlyDateRange(rangeValue);
  const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period);
  const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period);

  Logger.debug("Calculating previous period comparison", {
    currentFrom: from,
    currentTo: to,
    prevFrom: prevPeriodFrom,
    prevTo: prevPeriodTo,
    isYearly,
  });

  const previousPeriodData = await getPreviousPeriodSummary(
    userId,
    prevPeriodFrom,
    prevPeriodTo,
  );

  if (!previousPeriodData) {
    Logger.debug("No data found for previous period");
    return defaultResult;
  }

  const prevIncome = previousPeriodData.totalIncome || 0;
  const prevExpenses = previousPeriodData.totalExpenses || 0;
  const prevInvestment = previousPeriodData.totalInvestment || 0;
  const prevBalance = prevIncome - (prevExpenses + prevInvestment);

  return {
    income: calculatePercentageChange(
      prevIncome,
      currentPeriodValues.totalIncome,
    ),
    expenses: calculatePercentageChange(
      prevExpenses,
      currentPeriodValues.totalExpenses,
    ),
    investment: calculatePercentageChange(
      prevInvestment,
      currentPeriodValues.totalInvestment,
    ),
    balance: calculatePercentageChange(
      prevBalance,
      currentPeriodValues.availableBalance,
    ),
    prevPeriodFrom,
    prevPeriodTo,
    previousValues: {
      incomeAmount: prevIncome,
      expenseAmount: prevExpenses,
      investmentAmount: prevInvestment,
      balanceAmount: prevBalance,
    },
  };
};

/**
 * Helper: Get previous period summary data
 */
const getPreviousPeriodSummary = async (
  userId: string,
  prevPeriodFrom: Date,
  prevPeriodTo: Date,
): Promise<Record<string, any> | undefined> => {
  const filter = buildDateRangeFilter(userId, prevPeriodFrom, prevPeriodTo);

  const prevPeriodPipeline: PipelineStage[] = [
    { $match: filter },
    {
      $group: {
        _id: null,
        ...createTransactionTypeSumStages(),
      },
    },
  ];

  const [previous] = await TransactionModel.aggregate(prevPeriodPipeline);
  return previous;
};

/**
 * Fetch summary analytics for a given date range
 * Includes current period stats and period-over-period comparison
 */
export const summaryAnalyticsService = async (
  userId: string,
  dateRangePreset?: DateRangePreset,
  customFrom?: Date,
  customTo?: Date,
) => {
  Logger.info(`Executing summary analytics query`, {
    userId,
    dateRange: dateRangePreset || "unspecified",
  });
  const range = getDateRange(dateRangePreset, customFrom, customTo);

  const { from, to, value: rangeValue } = range;

  const currentPeriodData = await getCurrentPeriodSummary(userId, from, to);
  logAggregationResult("currentPeriod", 1, { rangeValue });

  const {
    totalIncome,
    totalExpenses,
    totalInvestment,
    availableBalance,
    transactionCount,
    savingData,
  } = extractAggregationResult(currentPeriodData, {
    availableBalance: 0,
    transactionCount: 0,
  });

  const percentageChange = await calculatePeriodComparison(
    userId,
    from,
    to,
    rangeValue,
    {
      totalIncome,
      totalExpenses,
      totalInvestment,
      availableBalance,
    },
  );

  return {
    availableBalance: convertToINR(availableBalance),
    totalIncome: convertToINR(totalIncome),
    totalExpenses: convertToINR(totalExpenses),
    totalInvestment: convertToINR(totalInvestment),
    savingRate: {
      percentage: parseFloat(savingData.savingsPercentage.toFixed(2)),
      expenseRatio: parseFloat(savingData.expenseRatio.toFixed(2)),
    },
    transactionCount,
    percentageChange: {
      ...percentageChange,
      previousValues: {
        incomeAmount: convertToINR(
          percentageChange.previousValues.incomeAmount,
        ),
        expenseAmount: convertToINR(
          percentageChange.previousValues.expenseAmount,
        ),
        investmentAmount: convertToINR(
          percentageChange.previousValues.investmentAmount,
        ),
        balanceAmount: convertToINR(
          percentageChange.previousValues.balanceAmount,
        ),
      },
    },
    preset: buildPresetObject(range, DateRangeEnum.ALL_TIME),
  };
};

/**
 * Helper: Build aggregation pipeline for chart data
 */
const buildChartAggregationPipeline = (
  filter: Record<string, any>,
): PipelineStage[] => {
  return [
    { $match: filter },
    //Group the transaction by date (YYYY-MM-DD)
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        ...createTransactionTypeSumStages(),
        incomeCount: {
          $sum: {
            $cond: [{ $eq: ["$type", TransactionTypeEnum.INCOME] }, 1, 0],
          },
        },

        expenseCount: {
          $sum: {
            $cond: [{ $eq: ["$type", TransactionTypeEnum.EXPENSE] }, 1, 0],
          },
        },

        investmentCount: {
          $sum: {
            $cond: [{ $eq: ["$type", TransactionTypeEnum.INVESTMENT] }, 1, 0],
          },
        },
      },
    },

    { $sort: { _id: 1 } },

    {
      $project: {
        _id: 0,
        date: "$_id",
        totalIncome: 1,
        totalExpenses: 1,
        totalInvestment: 1,
        incomeCount: 1,
        expenseCount: 1,
        investmentCount: 1,
      },
    },

    {
      $group: {
        _id: null,
        chartData: { $push: "$$ROOT" },
        totalIncomeCount: { $sum: "$incomeCount" },
        totalExpenseCount: { $sum: "$expenseCount" },
        totalInvestmentCount: { $sum: "$investmentCount" },
      },
    },

    {
      $project: {
        _id: 0,
        chartData: 1,
        totalIncomeCount: 1,
        totalExpenseCount: 1,
        totalInvestmentCount: 1,
      },
    },
  ];
};

/**
 * Fetch chart analytics data grouped by date
 * Shows daily transaction summaries for the given period
 */
export const chartAnalyticsService = async (
  userId: string,
  dateRangePreset?: DateRangePreset,
  customFrom?: Date,
  customTo?: Date,
) => {
  Logger.info(`Executing chart analytics query`, {
    userId,
    dateRange: dateRangePreset || "unspecified",
  });
  const range = getDateRange(dateRangePreset, customFrom, customTo);
  const { from, to, value: rangeValue } = range;

  const filter = buildDateRangeFilter(userId, from, to);

  const chartPipeline = buildChartAggregationPipeline(filter);
  const result = await TransactionModel.aggregate(chartPipeline);
  logAggregationResult("chartData", result.length);

  const resultData = result[0] || {};

  const transformedData = (resultData?.chartData || []).map((item: any) => ({
    date: item.date,
    income: convertToINR(item.totalIncome),
    expenses: convertToINR(item.totalExpenses),
    investment: convertToINR(item.totalInvestment),
  }));

  return {
    chartData: transformedData,
    totalIncomeCount: resultData.totalIncomeCount || 0,
    totalExpenseCount: resultData.totalExpenseCount || 0,
    totalInvestmentCount: resultData.totalInvestmentCount || 0,
    preset: buildPresetObject(range, DateRangeEnum.ALL_TIME),
  };
};

/**
 * Helper: Build aggregation pipeline for expense breakdown
 */
const buildExpenseBreakdownPipeline = (
  filter: Record<string, any>,
): PipelineStage[] => {
  return [
    { $match: filter },
    {
      $group: {
        _id: "$category",
        value: { $sum: { $abs: "$amount" } },
      },
    },
    { $sort: { value: -1 } },
    {
      $facet: {
        topThree: [{ $limit: 3 }],
        others: [
          { $skip: 3 },
          {
            $group: {
              _id: "others",
              value: { $sum: "$value" },
            },
          },
        ],
      },
    },

    {
      $project: {
        categories: {
          $concatArrays: ["$topThree", "$others"],
        },
      },
    },

    { $unwind: "$categories" },

    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$categories.value" },
        breakdown: { $push: "$categories" },
      },
    },

    {
      $project: {
        _id: 0,
        totalSpent: 1,
        breakdown: {
          $map: {
            input: "$breakdown",
            as: "cat",
            in: {
              name: "$$cat._id",
              value: "$$cat.value",
              percentage: {
                $cond: [
                  { $eq: ["$totalSpent", 0] },
                  0,
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$$cat.value", "$totalSpent"] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];
};

/**
 * Fetch expense breakdown by category (pie chart data)
 * Shows top 3 categories and groups remaining as "others"
 */
export const expensePieChartBreakdownService = async (
  userId: string,
  dateRangePreset?: DateRangePreset,
  customFrom?: Date,
  customTo?: Date,
) => {
  Logger.info(`Executing Expense Breakdown analytics query`, {
    userId,
    dateRange: dateRangePreset || "unspecified",
  });
  const range = getDateRange(dateRangePreset, customFrom, customTo);
  const { from, to, value: rangeValue } = range;

  const filter = buildDateRangeFilter(
    userId,
    from,
    to,
    TransactionTypeEnum.EXPENSE,
  );

  const pipeline = buildExpenseBreakdownPipeline(filter);
  const result = await TransactionModel.aggregate(pipeline);
  logAggregationResult("expenseBreakdown", result.length);

  const data = result[0] || {
    totalSpent: 0,
    breakdown: [],
  };

  const transformedData = {
    totalSpent: convertToINR(data.totalSpent),
    breakdown: data.breakdown.map((item: any) => ({
      ...item,
      value: convertToINR(item.value),
    })),
  };

  return {
    ...transformedData,
    preset: buildPresetObject(range, DateRangeEnum.ALL_TIME),
  };
};
