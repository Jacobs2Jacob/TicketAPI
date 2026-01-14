import { AuthUser } from "./auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
