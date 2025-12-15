import { Event } from "../entities/Event";

export interface IEventRepository {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  listByOrganizer(organizerId: string): Promise<Event[]>;
  // [ALTERADO] Adicionado parâmetro opcional filters
  listPublicEvents(filters?: { nome?: string; categoria?: string; cidade?: string }): Promise<Event[]>;
  update(event: Event): Promise<Event>;
}