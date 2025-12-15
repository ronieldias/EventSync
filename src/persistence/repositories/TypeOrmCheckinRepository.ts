import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Checkin } from "../../domain/entities/Checkin";
import { Registration } from "../../domain/entities/Registration";
import { ICheckinRepository } from "../../domain/repositories/ICheckinRepository";

export class TypeOrmCheckinRepository implements ICheckinRepository {
  private repository: Repository<Checkin>;

  constructor() {
    this.repository = AppDataSource.getRepository(Checkin);
  }

  async create(registration: Registration): Promise<Checkin> {
    const checkin = new Checkin();
    checkin.inscricao = registration;
    return this.repository.save(checkin);
  }

  async findByRegistrationId(registrationId: string): Promise<Checkin | null> {
    return this.repository.findOne({
      where: { inscricao: { id: registrationId } },
      relations: ["inscricao"],
    });
  }

  // Implementação da contagem
  async countByRegistrationId(registrationId: string): Promise<number> {
    return this.repository.count({
      where: { inscricao: { id: registrationId } }
    });
  }
}