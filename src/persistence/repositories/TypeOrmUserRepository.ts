import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class TypeOrmUserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    // CORREÇÃO: Usamos createQueryBuilder para forçar a busca da senha_hash (addSelect)
    return this.repository.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .addSelect("user.senha_hash") // <--- O segredo está aqui
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}