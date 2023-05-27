import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { router as usersRouter } from "./users/router";
import { router as authRouter } from "./auth/router";
import { router as monitoringRouter } from "./checks/router";
import { currentUser, requireAuth } from "./auth/middleware";
import { monitor } from "./monitoring/monitor";
dotenv.config();

export const app = express();

// ? use express async error
// ? add error handling instead of returning res.something...
app.use(express.json());
// app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use(currentUser);
app.use(requireAuth);
app.use("/checks", monitoringRouter);
console.log({ MONGODB_URI: process.env.MONGODB_URI });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
  console.log("After server start");

  monitor();
}

// main();
