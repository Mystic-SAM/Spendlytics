import type { SortOrder } from "mongoose";
import type { SortOptionsType } from "../@types/index.js";
import type { DateRangePreset } from "../enums/date-range.enum.js";
import { RecurringStatusEnum, type RecurringStatus, type TransactionType } from "../enums/model-enums.js";
import { getDateRange } from "./date.js";
import { escapeRegexChars } from "./helper.js";

export interface TransactionFilterParams {
  keyword?: string | undefined;
  type?: TransactionType | undefined;
  recurringStatus?: RecurringStatus | undefined;
  dateRangePreset?: DateRangePreset | undefined;
  customFrom?: Date | undefined;
  customTo?: Date | undefined;
}

export interface TransactionSortParams {
  sortBy: string;
  sortOrder: SortOptionsType["sortOrder"];
}

export const buildTransactionQueryOptions = (
  userId: string,
  filters: TransactionFilterParams,
  sortOptions: TransactionSortParams
) => {
  const { keyword, type, recurringStatus, dateRangePreset, customFrom, customTo } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    const escapedKeyword = escapeRegexChars(keyword);
    filterConditions.$or = [
      { title: { $regex: escapedKeyword, $options: "i" } },
      { category: { $regex: escapedKeyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === RecurringStatusEnum.RECURRING) {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === RecurringStatusEnum.NON_RECURRING) {
      filterConditions.isRecurring = false;
    }
  }

  if (dateRangePreset || (customFrom && customTo)) {
    const range = getDateRange(dateRangePreset, customFrom, customTo);
    if (range.from && range.to) {
      filterConditions.date = {
        $gte: range.from,
        $lte: range.to,
      };
    }
  }

  const sortObject: Record<string, SortOrder> = {
    [sortOptions.sortBy]: sortOptions.sortOrder,
    createdAt: -1, // Secondary sort: latest created transactions first
  };

  return { filterConditions, sortObject };
};