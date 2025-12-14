import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Registration } from "../../domain/entities/Registration";
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
    });
  }

  async findById(id: string): Promise<Registration | null> {
    return this.repository.findOne({ 
      where: { id },
      relations: ["evento", "usuario"] // Importante carregar as relações!
    });
  }

  async update(registration: Registration): Promise<Registration> {
    return this.repository.save(registration);
  }
}