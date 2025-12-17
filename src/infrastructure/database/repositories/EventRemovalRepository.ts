import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { EventRemovalEntity } from "../entities/EventRemovalEntity";
import { EventRemoval, CreateEventRemovalInput } from "../../../domain/entities/EventRemoval";

export class EventRemovalRepository {
  private repository: Repository<EventRemovalEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(EventRemovalEntity);
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<EventRemoval | null> {
    return this.repository.findOne({
      where: { userId, eventId },
    });
  }

  async findByUserId(userId: string): Promise<EventRemoval[]> {
    return this.repository.find({
      where: { userId },
      relations: ["event"],
      order: { removedAt: "DESC" },
    });
  }

  async findByEventId(eventId: string): Promise<EventRemoval[]> {
    return this.repository.find({
      where: { eventId },
      relations: ["user"],
      order: { removedAt: "DESC" },
    });
  }

  async create(data: CreateEventRemovalInput): Promise<EventRemoval> {
    const removal = this.repository.create(data);
    return this.repository.save(removal);
  }

  async isUserRemovedFromEvent(userId: string, eventId: string): Promise<boolean> {
    const removal = await this.repository.findOne({
      where: { userId, eventId },
    });
    return removal !== null;
  }
}
