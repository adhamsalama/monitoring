import { ObjectId } from "mongoose";

export enum LogStatus {
  UP = "UP",
  DOWN = "DOWN",
}
export interface Log {
  _id: ObjectId;
  checkId: string;
  status: LogStatus;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  responseTime: number;
  intervalInSeconds: number;
}
