import { Repository, In } from "typeorm";
import { AppDataSource } from "../data-source";
import { EventEntity, EventStatus } from "../entities/EventEntity";
import { IEventRepository } from "../../../domain/repositories/IEventRepository";
import { Event, CreateEventInput, UpdateEventInput } from "../../../domain/entities/Event";

export class EventRepository implements IEventRepository {
  private repository: Repository<EventEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(EventEntity);
  }

  async findById(id: string): Promise<Event | null> {
    const event = await this.repository.findOne({
      where: { id },
      relations: ["organizer", "subscriptions", "subscriptions.user"],
    });
    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.repository.find({
      relations: ["organizer"],
      order: { date: "ASC" },
    });
  }

  async findPublic(): Promise<Event[]> {
    return this.repository.find({
      where: {
        status: In(["published", "in_progress", "finished"]),
      },
      relations: ["organizer"],
      order: { date: "ASC" },
    });
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.repository.find({
      where: { organizerId },
      relations: ["organizer"],
      order: { createdAt: "DESC" },
    });
  }

  async findByStatus(status: EventStatus): Promise<Event[]> {
    return this.repository.find({
      where: { status },
      relations: ["organizer"],
      order: { date: "ASC" },
    });
  }

  async create(data: CreateEventInput): Promise<Event> {
    const event = this.repository.create({
      ...data,
      status: "draft",
      subscriptionsOpen: false,
    });
    return this.repository.save(event);
  }

  async update(id: string, data: UpdateEventInput): Promise<Event | null> {
    await this.repository.update(id, data as Partial<EventEntity>);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
