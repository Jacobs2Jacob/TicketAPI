import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppConfig } from "./config/env";
import { attachUserFromCookie } from "./middleware/auth";
import { HttpError } from "./common/http-error";

export type AppDeps = {
  config: AppConfig;
  authRouter: Router;
  agentRouter: Router;
  ticketRouter: Router;
};

export function createApp({ config, authRouter, agentRouter, ticketRouter }: AppDeps) {
  const app = express();

  app.use(
    cors({
      origin: config.frontendOrigin,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUserFromCookie(config));
 
  app.use("/api/auth", authRouter);
  app.use("/api/agents", agentRouter);
  app.use("/api/tickets", ticketRouter);

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err);
      if (err instanceof HttpError) {
        return res
          .status(err.status)
          .json({ message: err.message, details: err.details });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  );

  return app;
}
