import { Protocol, UrlCheck } from "../types";
import { Schema, model } from "mongoose";

const urlCheckSchema = new Schema<UrlCheck>(
  {
    url: {
      type: String,
      required: true,
    },
    protocol: {
      type: String,
      enum: Protocol,
      required: true,
    },
    path: {
      type: String,
      required: false,
    },
    port: {
      type: Number,
      required: false,
    },
    webhook: {
      type: String,
      required: false,
    },
    timeoutInSeconds: {
      type: Number,
      required: false,
      default: 5,
    },
    intervalInSeconds: {
      type: Number,
      required: false,
      default: 60 * 10,
    },
    threshold: {
      type: Number,
      required: false,
      default: 1,
    },
    authentication: {
      username: {
        type: String,
        required: false,
      },
      password: {
        type: String,
        required: false,
      },
    },
    httpHeaders: {
      _id: false,
      required: false,
      type: [
        {
          key: {
            type: String,
            required: true,
          },
          value: {
            type: String,
            required: true,
          },
        },
      ],
    },
    assert: {
      _id: false,
      required: false,
      type: {
        statusCode: {
          type: Number,
          required: false,
        },
      },
    },
    tags: {
      type: [String],
      required: false,
    },
    ignoreSSL: {
      type: Boolean,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);
urlCheckSchema.index({ userId: 1, url: 1, path: 1 }, { unique: true });
urlCheckSchema.index({ userId: 1, tags: 1 });

export const CheckModel = model<UrlCheck>("UrlCheck", urlCheckSchema);
