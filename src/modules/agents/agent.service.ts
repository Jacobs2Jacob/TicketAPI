import { AgentRepository } from "./agent.repository";
import { Agent } from "./agent.types";

export class AgentService {
  constructor(private repo: AgentRepository) {}

  getAll(): Promise<Agent[]> {
    return this.repo.getAll();
  }

  getById(id: string): Promise<Agent | null> {
    return this.repo.getById(id);
  }
}
