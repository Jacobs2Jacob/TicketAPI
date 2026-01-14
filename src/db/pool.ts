import { Pool } from "pg";
import { AppConfig } from "../config/env";

export function createPool(cfg: AppConfig): Pool {
  return new Pool({
    connectionString: cfg.databaseUrl,
  });
}
