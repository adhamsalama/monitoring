import { Schema } from "mongoose";

export interface User {
  _id: Schema.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  verified: boolean;
}
