import { Request } from "express";

export type UserPayload = { _id: string; email: string; name: string };

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
