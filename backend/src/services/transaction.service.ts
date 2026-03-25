import { TransactionModel } from "../models/transaction.model.js";
import {
  calculateNextEffectiveDate,
} from "../utils/helper.js";
import type { CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validator.js";
import { Logger } from "../utils/logger.js";
import { RecurringStatusEnum, type RecurringStatus, type TransactionType } from "../enums/model-enums.js";
import { NotFoundException } from "../utils/app-error.js";
import type { DateRangePreset } from "../enums/date-range.enum.js";
import { getDateRange } from "../utils/date.js";

export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string
) => {
  let nextRecurringDate: Date | undefined;

  if (body.isRecurring && body.recurringInterval) {
    nextRecurringDate = calculateNextEffectiveDate(
      body.date,
      body.recurringInterval
    );

    Logger.debug("Recurring transaction date calculated", {
      originalDate: body.date,
      nextRecurringDate,
      interval: body.recurringInterval,
    });
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: Number(body.amount),
    description: body.description ?? null,
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval ?? null,
    nextRecurringDate: nextRecurringDate ?? null,
    lastProcessed: null,
  });

  Logger.info("Transaction created successfully", {
    transactionId: transaction._id,
  });

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string | undefined;
    type?: TransactionType | undefined;
    recurringStatus?: RecurringStatus | undefined;
    dateRangePreset?: DateRangePreset | undefined;
    customFrom?: Date | undefined;
    customTo?: Date | undefined;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const { keyword, type, recurringStatus, dateRangePreset, customFrom, customTo } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
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

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ date: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!transaction) {
    const errMsg = "Transaction not found";
    Logger.error(errMsg, {
      transactionId,
      userId,
    });
    throw new NotFoundException(errMsg);
  }

  return transaction;
};

export const duplicateTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!transaction) {
    const errMsg = "Transaction not found for duplication";
    Logger.error(errMsg, {
      transactionId,
      userId,
    });
    throw new NotFoundException(errMsg);
  }

  const {
    _id,
    createdAt,
    updatedAt,
    recurringInterval,
    nextRecurringDate,
    lastProcessed,
    ...transactionData
  } = transaction.toObject();

  const duplicated = await TransactionModel.create({
    ...transactionData,
    title: `Duplicate - ${transaction.title}`,
    isRecurring: false,
    date: new Date(),
  });

  Logger.info("Transaction duplicated successfully", {
    originalTransactionId: transactionId,
    newTransactionId: duplicated._id,
  });

  return duplicated;
};

export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!existingTransaction) {
    const errMsg = "Transaction not found for update";
    Logger.error(errMsg, {
      transactionId,
      userId,
    });
    throw new NotFoundException(errMsg);
  }

  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;

  const date =
    body.date !== undefined ? new Date(body.date) : existingTransaction.date;

  const recurringInterval =
    body.recurringInterval || existingTransaction.recurringInterval;

  let nextRecurringDate: Date | undefined;

  if (isRecurring && recurringInterval) {
    nextRecurringDate = calculateNextEffectiveDate(date, recurringInterval);
    Logger.debug("Recurring settings updated for transaction", {
      transactionId,
      nextRecurringDate,
    });
  }

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: body.category }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: Number(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  Logger.info("Transaction updated successfully", {
    transactionId,
  });

  return;
};

export const deleteTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId,
  });
  if (!deleted) {
    const errMsg = "Transaction not found for deletion";
    Logger.error(errMsg, {
      transactionId,
      userId,
    });
    throw new NotFoundException(errMsg);
  }

  Logger.info("Transaction deleted successfully", {
    transactionId,
  });

  return;
};

export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[]
) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId,
  });

  if (result.deletedCount === 0) {
    const errMsg = "No transations found for bulk deletion";
    Logger.error(errMsg, {
      transactionIds,
      userId,
    });
    throw new NotFoundException(errMsg);
  }

  Logger.info("Bulk delete transactions executed", {
    deletedCount: result.deletedCount,
    totalRequested: transactionIds.length,
  });

  return {
    success: true,
    deletedCount: result.deletedCount,
  };
};

export const bulkInsertTransactionService = async (
  userId: string,
  transactions: CreateTransactionType[]
) => {
  try {
    const transactionDocs = transactions.map((tx) => ({
      ...tx,
      userId,
      isRecurring: false,
      nextRecurringDate: null,
      recurringInterval: null,
      lastProcessed: null,
    }));

    const result = await TransactionModel.insertMany(transactionDocs, {
      ordered: true,
    });

    Logger.info("Bulk transactions inserted successfully", {
      insertedCount: result.length,
      userId,
    });

    return {
      insertedCount: result.length,
      success: true,
    };
  } catch (error) {
    Logger.error("Error during bulk transaction insertion", {
      error,
      userId,
    });
    throw error;
  }
};