import { IMessageRepository } from "../../domain/repositories/IMessageRepository";
import { IFriendshipRepository } from "../../domain/repositories/IFriendshipRepository";

interface IRequest {
  userId: string;
  otherUserId: string;
}

export class ListMessagesUseCase {
  constructor(
    private messageRepo: IMessageRepository,
    private friendshipRepo: IFriendshipRepository
  ) {}

  async execute({ userId, otherUserId }: IRequest) {
    // Opcional: Verificar se são amigos antes de listar?
    // Geralmente sim, mas para histórico, basta listar.
    return this.messageRepo.listConversation(userId, otherUserId);
  }
}