import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { router as authRouter } from "./auth/router";
import { router as monitoringRouter } from "./checks/router";
import { currentUser, requireAuth } from "./auth/middleware";

dotenv.config();

export const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use(currentUser);
app.use(requireAuth);
app.use("/checks", monitoringRouter);

export async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
}
