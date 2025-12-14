import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Registration, RegistrationStatus } from "../../domain/entities/Registration";
import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";

export class TypeOrmRegistrationRepository implements IRegistrationRepository {
  private repository: Repository<Registration>;

  constructor() {
    this.repository = AppDataSource.getRepository(Registration);
  }

  async create(registration: Registration): Promise<Registration> {
    return this.repository.save(registration);
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Registration | null> {
    return this.repository.findOne({
      where: { usuario_id: userId, evento_id: eventId },
      relations: ["evento", "usuario"],
    });
  }

  async findById(id: string): Promise<Registration | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["evento", "usuario"],
    });
  }

  async update(registration: Registration): Promise<Registration> {
    return this.repository.save(registration);
  }

  async listByEvent(eventId: string): Promise<Registration[]> {
    return this.repository.find({
      where: { evento_id: eventId, status: RegistrationStatus.ATIVO },
      relations: ["usuario"],
    });
  }

  async checkIntersection(userA: string, userB: string): Promise<boolean> {
    const count = await this.repository.createQueryBuilder("r1")
      .innerJoin("registrations", "r2", "r1.evento_id = r2.evento_id")
      .where("r1.usuario_id = :userA", { userA })
      .andWhere("r2.usuario_id = :userB", { userB })
      .andWhere("r1.status = :status", { status: RegistrationStatus.ATIVO })
      .andWhere("r2.status = :status", { status: RegistrationStatus.ATIVO })
      .getCount();

    return count > 0;
  }

  // Implementação do novo método
  async listByUser(userId: string): Promise<Registration[]> {
    return this.repository.find({
      where: { usuario_id: userId },
      relations: ["evento"], // Traz dados do evento
      order: { data_inscricao: "DESC" }
    });
  }
}