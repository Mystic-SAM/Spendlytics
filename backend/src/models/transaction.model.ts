import mongoose, { Schema, type InferSchemaType } from "mongoose";
import {
  TransactionStatusEnum,
  TransactionTypeEnum,
  RecurringIntervalEnum,
  PaymentMethodEnum,
} from "../enums/model-enums.js";
import { convertToINR, convertToPaise } from "../utils/currency.js";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },
    // Amount is stored in paise (smallest currency unit) to preserve precision.
    // Setter: Converts INR input to paise before saving to database.
    // Getter: Converts paise back to INR when retrieving from database.
    amount: {
      type: Number,
      required: true,
      min: 1,
      set: (value: number) => convertToPaise(value),
      get: (value: number) => convertToINR(value),
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: Object.values(RecurringIntervalEnum),
      default: undefined,
    },
    nextRecurringDate: {
      type: Date,
      default: undefined,
    },
    lastProcessed: {
      type: Date,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.COMPLETED,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      default: PaymentMethodEnum.UPI,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

// Indexes for common query patterns
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ isRecurring: 1, nextRecurringDate: 1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema>;

export const TransactionModel = mongoose.model(
  "Transaction",
  transactionSchema,
);
