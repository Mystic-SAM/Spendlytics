import mongoose, { type InferSchemaType, Schema } from "mongoose";
import { ReportStatusEnum } from "../enums/model-enums.js";

const reportSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    period: {
      type: String,
      required: true,
    },
    sentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatusEnum),
      default: ReportStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export type ReportDocument = InferSchemaType<typeof reportSchema>;

export const ReportModel = mongoose.model("Report", reportSchema);
