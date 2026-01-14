import { Router } from "express";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { requireAuth } from "../../middleware/auth";
import { AgentService } from "./agent.service";

export function buildAgentRouter(service: AgentService): Router {
  const router = Router();

  router.use(requireAuth);

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const agents = await service.getAll();
      res.json(agents);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const agent = await service.getById(req.params.id);
      if (!agent) {
        throw new HttpError(404, `Agent ${req.params.id} not found`);
      }
      res.json(agent);
    })
  );

  return router;
}
