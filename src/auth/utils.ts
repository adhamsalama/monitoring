import jwt from "jsonwebtoken";
import { User } from "../users/types";

export function generateVerificationToken(
  user: Omit<User, "password">
): string {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
}

export function generateAccessToken(user: Omit<User, "password">): string {
  return jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
}
