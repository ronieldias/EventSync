import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Friendship } from "../../domain/entities/Friendship";
import { IFriendshipRepository } from "../../domain/repositories/IFriendshipRepository";

export class TypeOrmFriendshipRepository implements IFriendshipRepository {
  private repository: Repository<Friendship>;

  constructor() {
    this.repository = AppDataSource.getRepository(Friendship);
  }

  async create(friendship: Friendship): Promise<Friendship> {
    return this.repository.save(friendship);
  }

  async findByUsers(userA: string, userB: string): Promise<Friendship | null> {
    // Busca amizade em qualquer direção (A->B ou B->A)
    return this.repository.findOne({
      where: [
        { solicitante_id: userA, destinatario_id: userB },
        { solicitante_id: userB, destinatario_id: userA },
      ],
    });
  }

  async findById(id: string): Promise<Friendship | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(friendship: Friendship): Promise<Friendship> {
    return this.repository.save(friendship);
  }
}