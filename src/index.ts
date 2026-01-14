import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { createPool } from "./db/pool";
import { seedDatabase } from "./db/seed";
import { AgentRepository } from "./modules/agents/agent.repository";
import { AgentService } from "./modules/agents/agent.service";
import { buildAgentRouter } from "./modules/agents/agent.routes";
import { AuthService } from "./modules/auth/auth.service";
import { buildAuthRouter } from "./modules/auth/auth.routes";
import { TicketRepository } from "./modules/tickets/ticket.repository";
import { TicketEventPublisher } from "./modules/tickets/ticket.events";
import { buildTicketRouter } from "./modules/tickets/ticket.routes";
import { TicketService } from "./modules/tickets/ticket.service";

async function bootstrap() {
  const config = loadConfig();
  const pool = createPool(config);
  await seedDatabase(pool);

  const ticketPublisher = new TicketEventPublisher();

  const ticketRepo = new TicketRepository(pool);
  const ticketService = new TicketService(ticketRepo, ticketPublisher);

  const agentRepo = new AgentRepository(pool);
  const agentService = new AgentService(agentRepo);

  const authService = new AuthService(config);

  const ticketRouter = buildTicketRouter(ticketService);
  const agentRouter = buildAgentRouter(agentService);
  const authRouter = buildAuthRouter(authService, config);

  const app = createApp({ config, authRouter, agentRouter, ticketRouter });
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: config.frontendOrigin,
      credentials: true,
    },
  });

  ticketPublisher.setServer(io);

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
  });

  server.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
