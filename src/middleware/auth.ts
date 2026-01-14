import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppConfig } from "../config/env";
import { AuthUser } from "../types/auth";

export function attachUserFromCookie(cfg: AppConfig): RequestHandler {
  return (req, _res, next) => {
    const token = req.cookies?.["access_token"];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, cfg.jwtSecret) as jwt.JwtPayload;
      const user: AuthUser = {
        id: (decoded.sub as string) ?? "",
        name: (decoded.name as string) ?? "",
      };
      req.user = user;
    } catch {
      // ignore invalid token; request continues as anonymous
    }

    return next();
  };
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
