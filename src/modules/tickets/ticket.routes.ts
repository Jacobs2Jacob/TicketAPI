import { Router } from "express";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { requireAuth } from "../../middleware/auth";
import { TicketService } from "./ticket.service";
import {
  TicketPriority,
  TicketQuery,
  TicketStatus,
} from "./ticket.types";

export function buildTicketRouter(service: TicketService): Router {
  const router = Router();

  router.use(requireAuth);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const statusVal = parseStatus(req.query.status as string | undefined);
      if (req.query.status && !statusVal) {
        throw new HttpError(400, "Invalid status");
      }

      const priorityVal = parsePriority(req.query.priority as string | undefined);
      if (req.query.priority && !priorityVal) {
        throw new HttpError(400, "Invalid priority");
      }

      const q: TicketQuery = {
        status: statusVal,
        priority: priorityVal,
        sort: (req.query.sort as string | undefined) ?? undefined,
        page: toNumber(req.query.page as string | undefined),
        pageSize: toNumber(req.query.pageSize as string | undefined),
        offset: toNumber(req.query.offset as string | undefined),
      };

      const result = await service.search(q);
      res.json(result);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const ticket = await service.getById(req.params.id);
      if (!ticket) {
        throw new HttpError(404, `Ticket ${req.params.id} not found`);
      }
      res.json(ticket);
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const { title, description, priority, assigneeId } = req.body ?? {};
      if (!title || !description || !priority) {
        throw new HttpError(400, "title, description and priority are required");
      }

      const priorityVal = parsePriority(priority);
      if (!priorityVal) {
        throw new HttpError(400, "Invalid priority");
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, "Unauthorized");
      }

      const created = await service.create({
        title,
        description,
        priority: priorityVal,
        assigneeId: assigneeId ?? null,
        createdById: userId,
        updatedById: userId,
      });

      res.status(201).json(created);
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const { title, description, priority, status, assigneeId } = req.body ?? {};
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, "Unauthorized");
      }

      const priorityVal = priority ? parsePriority(priority) : undefined;
      if (priority !== undefined && !priorityVal) {
        throw new HttpError(400, "Invalid priority");
      }

      const statusVal = status ? parseStatus(status) : undefined;
      if (status !== undefined && !statusVal) {
        throw new HttpError(400, "Invalid status");
      }

      const assigneeValue =
        assigneeId === undefined ? undefined : assigneeId ?? null;

      const updated = await service.update({
        id: req.params.id,
        title,
        description,
        priority: priorityVal,
        status: statusVal,
        assigneeId: assigneeValue,
        updatedById: userId,
      });

      res.json(updated);
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      await service.delete(req.params.id);
      res.status(204).send();
    })
  );

  return router;
}

function parsePriority(value?: string): TicketPriority | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  switch (normalized) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "critical":
      return "Critical";
    default:
      return undefined;
  }
}

function parseStatus(value?: string): TicketStatus | undefined {
  
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case "open":
      return "Open";
    case "inprogress":
    case "in_progress":
      return "InProgress";
    case "resolved":
      return "Resolved";
    default:
      return undefined;
  }
}

function toNumber(value?: string | string[]): number | undefined {
  if (!value) return undefined;
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
