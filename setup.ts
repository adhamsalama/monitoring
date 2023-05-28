import { MongoMemoryServer } from "mongodb-memory-server";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

beforeAll(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(`error ${err}`));
});
afterEach(async () => {});
afterAll(async () => {});
