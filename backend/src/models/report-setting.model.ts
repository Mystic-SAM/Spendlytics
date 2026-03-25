import mongoose, { type InferSchemaType, Schema } from "mongoose";
import { ReportFrequencyEnum } from "../enums/model-enums.js";

const reportSettingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    frequency: {
      type: String,
      enum: Object.values(ReportFrequencyEnum),
      default: ReportFrequencyEnum.MONTHLY,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    nextReportDate: {
      type: Date,
    },
    lastSentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export type ReportSettingDocument = InferSchemaType<typeof reportSettingSchema>;

export const ReportSettingModel = mongoose.model(
  "ReportSetting",
  reportSettingSchema,
);
