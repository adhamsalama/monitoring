import { MongoMemoryServer } from "mongodb-memory-server";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { UserModel } from "./src/users/models/user";
import { CheckModel } from "./src/checks/models/check";
import { LogModel } from "./src/monitoring/models/url";

dotenv.config();

beforeAll(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri).catch((err) => console.log(`error ${err}`));
});
afterEach(async () => {
  await UserModel.deleteMany({});
  await CheckModel.deleteMany({});
  await LogModel.deleteMany({});
});
afterAll(async () => {});
