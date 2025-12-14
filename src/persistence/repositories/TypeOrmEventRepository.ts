import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Event, EventStatus } from "../../domain/entities/Event";
import { IEventRepository } from "../../domain/repositories/IEventRepository";

export class TypeOrmEventRepository implements IEventRepository {
  private repository: Repository<Event>;

  constructor() {
    this.repository = AppDataSource.getRepository(Event);
  }

  async create(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  async findById(id: string): Promise<Event | null> {
    return this.repository.findOne({ where: { id } });
  }

  async listByOrganizer(organizerId: string): Promise<Event[]> {
    return this.repository.find({ where: { organizador_id: organizerId } });
  }

  async listPublicEvents(): Promise<Event[]> {
    return this.repository.find({ where: { status: EventStatus.PUBLICADO } });
  }

  async update(event: Event): Promise<Event> {
    return this.repository.save(event);
  }
}