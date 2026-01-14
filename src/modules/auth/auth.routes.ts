import { Router } from "express";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { AppConfig } from "../../config/env";
import { requireAuth } from "../../middleware/auth";
import { AuthService } from "./auth.service";

export function buildAuthRouter(service: AuthService, cfg: AppConfig): Router {
  const router = Router();

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const id = (req.body?.id as string | undefined) ?? "bc149803-43b6-47ba-a470-3d0b6e2401f1";
      const name = (req.body?.name as string | undefined) ?? "Agent Yaniv";

      const token = service.issueToken({ id, name });
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: cfg.isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      res.json({ success: true, user: { id, name } });
    })
  );

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw new HttpError(401, "Unauthorized");
      }
      res.json(req.user);
    })
  );

  return router;
}
