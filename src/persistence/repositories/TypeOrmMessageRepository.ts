import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Message } from "../../domain/entities/Message";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";

export class TypeOrmMessageRepository implements IMessageRepository {
  private repository: Repository<Message>;

  constructor() {
    this.repository = AppDataSource.getRepository(Message);
  }

  async create(message: Message): Promise<Message> {
    return this.repository.save(message);
  }

  async listConversation(userA: string, userB: string): Promise<Message[]> {
    return this.repository.find({
      where: [
        { remetente_id: userA, destinatario_id: userB },
        { remetente_id: userB, destinatario_id: userA },
      ],
      order: { data_envio: "ASC" },
    });
  }
}