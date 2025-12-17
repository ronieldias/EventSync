import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../entities/UserEntity";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User, CreateUserInput, UpdateUserInput } from "../../../domain/entities/User";

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { email } });
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
