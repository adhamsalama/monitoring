import { Schema } from "mongoose";

export enum Protocol {
  HTTP = "http",
  HTTPS = "https",
  tcp = "tcp",
}

export interface UrlCheck {
  _id: Schema.Types.ObjectId;
  userId: string;
  url: string;
  protocol: Protocol;
  path?: string;
  port?: number;
  webhook?: string;
  timeoutInSeconds: number;
  intervalInSeconds: number;
  threshold: number;
  authentication?: {
    username: string;
    password: string;
  };
  httpHeaders?: {
    key: string;
    value: string;
  }[];
  assert?: {
    statusCode?: number;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
