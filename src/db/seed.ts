import { randomUUID } from "crypto";
import { Pool } from "pg";

export async function seedDatabase(pool: Pool): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id uuid PRIMARY KEY,
        name varchar(120) NOT NULL,
        email varchar(120) NOT NULL UNIQUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id uuid PRIMARY KEY,
        title varchar(160) NOT NULL,
        description varchar(200) NOT NULL,
        priority varchar(20) NOT NULL,
        status varchar(20) NOT NULL,
        assignee_id uuid REFERENCES agents(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        created_by_id uuid NOT NULL,
        updated_by_id uuid NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status_priority_updated_at
      ON tickets (status, priority, updated_at);
    `);

    const agentCount = await client.query<{ count: string }>(
      "SELECT COUNT(*)::int AS count FROM agents"
    );

    if ((Number(agentCount.rows[0]?.count) ?? 0) === 0) {
      const adminId = randomUUID();
      const yanivId = randomUUID();
      const johnId = randomUUID();

      await client.query(
        `
        INSERT INTO agents (id, name, email)
        VALUES ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)
      `,
        [
          adminId,
          "Admin",
          "admin@example.com",
          yanivId,
          "Yaniv",
          "yaniv@example.com",
          johnId,
          "John",
          "john@example.com",
        ]
      );

      const tickets = [
        {
          title: "Cannot login",
          description: "User cannot login",
          priority: "High",
          status: "Open",
          assigneeId: adminId,
        },
        {
          title: "Billing issue",
          description: "Charge discrepancy",
          priority: "Medium",
          status: "InProgress",
          assigneeId: adminId,
        },
        {
          title: "Feature request",
          description: "Add dark mode",
          priority: "Low",
          status: "Open",
          assigneeId: adminId,
        },
      ];

      for (let i = 0; i < 10; i++) {
        for (const t of tickets) {
          const id = randomUUID();
          await client.query(
            `
            INSERT INTO tickets (
              id, title, description, priority, status, assignee_id,
              created_by_id, updated_by_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [
              id,
              t.title,
              t.description,
              t.priority,
              t.status,
              t.assigneeId,
              adminId,
              adminId,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database seed failed:", err);
    throw err;
  } finally {
    client.release();
  }
}
