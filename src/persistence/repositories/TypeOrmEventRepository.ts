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

  // Implementação dos filtros de busca
  async listPublicEvents(filters?: { nome?: string; categoria?: string; cidade?: string }): Promise<Event[]> {
    const query = this.repository.createQueryBuilder("event")
      .where("event.status = :status", { status: EventStatus.PUBLICADO });

    if (filters?.nome) {
      // ILIKE é case-insensitive no Postgres
      query.andWhere("event.titulo ILIKE :nome", { nome: `%${filters.nome}%` });
    }
    
    if (filters?.categoria) {
      query.andWhere("event.categoria ILIKE :cat", { cat: `%${filters.categoria}%` });
    }
    
    if (filters?.cidade) {
      // Busca simplificada no campo local
      query.andWhere("event.local ILIKE :local", { local: `%${filters.cidade}%` });
    }

    return query.orderBy("event.data_inicio", "ASC").getMany();
  }

  async update(event: Event): Promise<Event> {
    return this.repository.save(event);
  }
}