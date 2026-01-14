import dotenv from "dotenv";

dotenv.config();

export type AppConfig = {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  frontendOrigin: string;
  isProduction: boolean;
};

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT ?? 5288);
  const databaseUrl =
    process.env.DATABASE_URL ??
    "postgres://postgres:1234@localhost:5432/ticketdb";
  const jwtSecret =
    process.env.JWT_SECRET ??
    "b8f3a5d3a6c97d82144f29a8121f0e50a5e1a9d4fcd348b2af7314cc7a521b8e";
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
  const isProduction = process.env.NODE_ENV === "production";

  return { port, databaseUrl, jwtSecret, frontendOrigin, isProduction };
}
