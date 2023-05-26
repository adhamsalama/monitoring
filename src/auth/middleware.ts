import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "./types";

async function currentUser(req: Request, _: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next();
  }

  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = payload;
  } catch (err) {
    console.error(err);
  }
  return next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).send("Not authorized");
  }
  next();
}

export { currentUser, requireAuth };
