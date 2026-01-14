import { randomUUID } from "crypto";
import { Pool } from "pg";
import { HttpError } from "../../common/http-error";
import {
  CreateTicketInput,
  PagedResult,
  Ticket,
  TicketPriority,
  TicketQuery,
  TicketStatus,
  UpdateTicketInput,
} from "./ticket.types";

const sortMap: Record<string, string> = {
  updatedat_asc: "updated_at ASC",
  priority_desc: "priority DESC, updated_at DESC",
  priority_asc: "priority ASC, updated_at DESC",
  updatedat_desc: "updated_at DESC",
};

export class TicketRepository {
  constructor(private pool: Pool) {}

  async search(q: TicketQuery): Promise<PagedResult<Ticket>> {
    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (q.status) {
      params.push(q.status);
      filters.push(`status = $${params.length}`);
    }

    if (q.priority) {
      params.push(q.priority);
      filters.push(`priority = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const totalRes = await this.pool.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM tickets ${whereClause}`,
      params
    );

    const total = totalRes.rows[0]?.count ?? 0;
    const page = q.page ?? 1;
    const pageSize = Math.min(q.pageSize ?? 30, 100);
    const offset = q.offset ?? (page - 1) * pageSize;
    const sortKey = sortMap[(q.sort ?? "updatedat_desc").toLowerCase()] ??
      sortMap.updatedat_desc;

    const itemsRes = await this.pool.query<TicketRow>(
      `
      SELECT id, title, description, priority, status, assignee_id,
             created_at, updated_at, created_by_id, updated_by_id
      FROM tickets
      ${whereClause}
      ORDER BY ${sortKey}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
      [...params, pageSize, offset]
    );

    const items = itemsRes.rows.map(mapTicketRow);

    return { items, total, page, pageSize };
  }

  async get(id: string): Promise<Ticket | null> {
    const res = await this.pool.query<TicketRow>(
      `
      SELECT id, title, description, priority, status, assignee_id,
             created_at, updated_at, created_by_id, updated_by_id
      FROM tickets
      WHERE id = $1
    `,
      [id]
    );

    return res.rows[0] ? mapTicketRow(res.rows[0]) : null;
  }

  async create(input: CreateTicketInput): Promise<Ticket> {
    const id = randomUUID();

    const res = await this.pool.query<TicketRow>(
      `
      INSERT INTO tickets (
        id, title, description, priority, status, assignee_id,
        created_by_id, updated_by_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, priority, status, assignee_id,
                created_at, updated_at, created_by_id, updated_by_id
    `,
      [
        id,
        input.title,
        input.description,
        input.priority,
        input.status ?? "Open",
        input.assigneeId ?? null,
        input.createdById,
        input.updatedById,
      ]
    );

    return mapTicketRow(res.rows[0]);
  }

  async update(input: UpdateTicketInput): Promise<Ticket> {
    const sets: string[] = [];
    const params: Array<string | TicketPriority | TicketStatus | null> = [];

    if (input.title !== undefined) {
      params.push(input.title);
      sets.push(`title = $${params.length}`);
    }
    if (input.description !== undefined) {
      params.push(input.description);
      sets.push(`description = $${params.length}`);
    }
    if (input.priority !== undefined) {
      params.push(input.priority);
      sets.push(`priority = $${params.length}`);
    }
    if (input.status !== undefined) {
      params.push(input.status);
      sets.push(`status = $${params.length}`);
    }
    if (input.assigneeId !== undefined) {
      params.push(input.assigneeId);
      sets.push(`assignee_id = $${params.length}`);
    }

    if (sets.length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    params.push(input.updatedById);
    sets.push(`updated_by_id = $${params.length}`);
    sets.push(`updated_at = NOW()`);

    params.push(input.id);

    const res = await this.pool.query<TicketRow>(
      `
      UPDATE tickets
      SET ${sets.join(", ")}
      WHERE id = $${params.length}
      RETURNING id, title, description, priority, status, assignee_id,
                created_at, updated_at, created_by_id, updated_by_id
    `,
      params
    );

    if (!res.rows[0]) {
      throw new HttpError(404, `Ticket ${input.id} not found`);
    }

    return mapTicketRow(res.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query("DELETE FROM tickets WHERE id = $1", [id]);
  }
}

type TicketRow = {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee_id: string | null;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
  updated_by_id: string;
};

function mapTicketRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    assigneeId: row.assignee_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    createdById: row.created_by_id,
    updatedById: row.updated_by_id,
  };
}
