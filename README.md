## TicketAPI (Node.js + Express + Socket.IO)
 
### Quick start
- Requirements: Node 18+, PostgreSQL
- Env vars (defaults shown):
  - `DATABASE_URL=postgres://postgres:1234@localhost:5432/ticketdb`
  - `JWT_SECRET` (defaults to legacy sample key)
  - `FRONTEND_ORIGIN=http://localhost:5173`
  - `PORT=3000`
- Install & run:
  - `npm install`
  - `npm run dev` (ts-node-dev) or `npm run build && npm start`

### API
- `POST /api/auth/login` → sets `access_token` HTTP-only cookie (mock login by default).
- `GET /api/auth/me` → current user.
- `GET /api/agents` / `GET /api/agents/:id`
- `GET /api/tickets` with filters `status`, `priority`, `sort`, `page`, `pageSize`, `offset`
- `GET /api/tickets/:id`
- `POST /api/tickets` → create
- `PATCH /api/tickets/:id` → update
- `DELETE /api/tickets/:id`

All non-auth routes require the JWT cookie.

### Realtime (socket.io)
Connect to the same host/port; events broadcast to all clients:
- `ticket:created` `{ ticket }`
- `ticket:updated` `{ ticket }`
- `ticket:deleted` `{ id }`

### Notes
- Database schema and seed data are created automatically on start (`src/db/seed.ts`).
- Legacy .NET files remain in the repo for reference but are no longer used by the Node runtime.
