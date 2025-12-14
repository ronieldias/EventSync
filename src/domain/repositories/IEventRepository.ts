import { Event } from "../entities/Event";

export interface IEventRepository {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  listByOrganizer(organizerId: string): Promise<Event[]>;
  listPublicEvents(): Promise<Event[]>;
  update(event: Event): Promise<Event>;
}