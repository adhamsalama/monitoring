import { User } from "../types";
import { Schema, model } from "mongoose";

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

userSchema.index({ email: 1 });

export const UserModel = model("User", userSchema);
