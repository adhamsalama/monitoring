import { Schema, model } from "mongoose";
import { LogStatus, Log } from "../types";

const logSchema = new Schema<Log>(
  {
    checkId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      values: LogStatus,
      required: true,
    },
    url: {
      type: String,
    },
    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LogModel = model<Log>("Log", logSchema);
