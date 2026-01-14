import { TicketRepository } from "./ticket.repository";
import { TicketEventPublisher } from "./ticket.events";
import {
  CreateTicketInput,
  PagedResult,
  Ticket,
  TicketQuery,
  UpdateTicketInput,
} from "./ticket.types";

export class TicketService {
  constructor(
    private repo: TicketRepository,
    private publisher: TicketEventPublisher
  ) {}

  search(q: TicketQuery): Promise<PagedResult<Ticket>> {
    return this.repo.search(q);
  }

  getById(id: string): Promise<Ticket | null> {
    return this.repo.get(id);
  }

  async create(input: CreateTicketInput): Promise<Ticket> {
    const created = await this.repo.create(input);
    this.publisher.ticketCreated(created);
    return created;
  }

  async update(input: UpdateTicketInput): Promise<Ticket> {
    const updated = await this.repo.update(input);
    this.publisher.ticketUpdated(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
    this.publisher.ticketDeleted(id);
  }
}
