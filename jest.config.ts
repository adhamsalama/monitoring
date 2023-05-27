// import * as dotenv from "dotenv";
// import { MongoMemoryServer } from "mongodb-memory-server";
// import mongoose from "mongoose";
// // import { app } from "./src/index";
// dotenv.config();
// beforeAll(async () => {
//   console.log("aaaaaaa");

//   const mongod = await MongoMemoryServer.create();
//   const uri = mongod.getUri();
//   await mongoose
//     .connect(uri)
//     .then(() => {
//       console.log("Connected");
//     })
//     .catch((err) => console.log(`error ${err}`));
//   // app.listen(3000, () => console.log("Testing..."));
// });

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setup.ts"],
};
