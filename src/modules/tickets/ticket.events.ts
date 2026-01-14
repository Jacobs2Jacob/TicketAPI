import { Server } from "socket.io";
import { Ticket } from "./ticket.types";

export class TicketEventPublisher {
  private io?: Server;

  constructor(io?: Server) {
    this.io = io;
  }

  setServer(io: Server) {
    this.io = io;
  }

  ticketCreated(ticket: Ticket) {
    this.io?.emit("ticket:created", ticket);
  }

  ticketUpdated(ticket: Ticket) {
    this.io?.emit("ticket:updated", ticket); 
  }

  ticketDeleted(id: string) {
    this.io?.emit("ticket:deleted", id);
  }
}
