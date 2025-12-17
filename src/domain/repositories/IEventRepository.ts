import { Event, CreateEventInput, UpdateEventInput, EventStatus } from "../entities/Event";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  findPublic(): Promise<Event[]>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  findByStatus(status: EventStatus): Promise<Event[]>;
  create(data: CreateEventInput): Promise<Event>;
  update(id: string, data: UpdateEventInput): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
}
