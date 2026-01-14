import { Pool } from "pg";
import { Agent } from "./agent.types";

export class AgentRepository {
  constructor(private pool: Pool) {}

  async getAll(): Promise<Agent[]> {
    const res = await this.pool.query<Agent>(
      "SELECT id, name, email FROM agents ORDER BY name"
    );
    return res.rows;
  }

  async getById(id: string): Promise<Agent | null> {
    const res = await this.pool.query<Agent>(
      "SELECT id, name, email FROM agents WHERE id = $1",
      [id]
    );
    return res.rows[0] ?? null;
  }
}
