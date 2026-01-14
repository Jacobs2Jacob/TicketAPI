export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketStatus = "Open" | "InProgress" | "Resolved";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  status?: TicketStatus;
  assigneeId?: string | null;
  createdById: string;
  updatedById: string;
};

export type UpdateTicketInput = {
  id: string;
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigneeId?: string | null;
  updatedById: string;
};

export type TicketQuery = {
  status?: TicketStatus;
  priority?: TicketPriority;
  sort?: string;
  page?: number;
  pageSize?: number;
  offset?: number;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
