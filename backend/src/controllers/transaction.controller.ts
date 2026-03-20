import { HTTP_STATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { bulkDeleteTransactionSchema, bulkInsertTransactionSchema, createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator.js";
import { bulkDeleteTransactionService, bulkInsertTransactionService, createTransactionService, deleteTransactionService, duplicateTransactionService, getAllTransactionService, getTransactionByIdService, updateTransactionService } from "../services/transaction.service.js";
import { Logger } from "../utils/logger.js";
import type { RecurringStatus, TransactionType } from "../enums/model-enums.js";
import type { DateRangePreset } from "../enums/date-range.enum.js";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 1;

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    const transaction = await createTransactionService(body, userId);

    Logger.info("Transaction created successfully", {
      transactionId: transaction._id,
      userId,
      type: body.type,
      amount: body.amount,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Transaction created successfully",
      transaction,
    });
  }
);

export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { keyword, type, recurringStatus, preset, from, to } = req.query;

    const filters = {
      keyword: keyword as string | undefined,
      type: type as TransactionType | undefined,
      recurringStatus: recurringStatus as RecurringStatus | undefined,
      dateRangePreset: preset as DateRangePreset | undefined,
      customFrom: from ? new Date(from as string) : undefined,
      customTo: to ? new Date(to as string) : undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE,
      pageNumber: parseInt(req.query.pageNumber as string) || DEFAULT_PAGE_NUMBER,
    };

    const result = await getAllTransactionService(userId, filters, pagination);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction fetched successfully",
      ...result,
    });
  }
);

export const getTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await getTransactionByIdService(userId, transactionId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction fetched successfully",
      transaction,
    });
  }
);

export const duplicateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await duplicateTransactionService(
      userId,
      transactionId
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: transaction,
    });
  }
);

export const updateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    await updateTransactionService(userId, transactionId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction updated successfully",
    });
  }
);

export const deleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    await deleteTransactionService(userId, transactionId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction deleted successfully",
    });
  }
);

export const bulkDeleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactionIds } = bulkDeleteTransactionSchema.parse(req.body);

    const result = await bulkDeleteTransactionService(userId, transactionIds);

    let message: string;
    if (result.deletedCount < transactionIds.length) {
      message = "Transactions deleted partially";
    } else {
      message = "All transactions deleted successfully";
    }

    return res.status(HTTP_STATUS.OK).json({
      message,
      ...result,
    });
  }
);

export const bulkInsertTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactions } = bulkInsertTransactionSchema.parse(req.body);

    const result = await bulkInsertTransactionService(userId, transactions);

    return res.status(HTTP_STATUS.OK).json({
      message: "Bulk transactions inserted successfully",
      ...result,
    });
  }
);