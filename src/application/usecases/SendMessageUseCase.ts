import { Message } from "../../domain/entities/Message";
import { FriendshipStatus } from "../../domain/entities/Friendship";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";
import { IFriendshipRepository } from "../../domain/repositories/IFriendshipRepository";

interface IRequest {
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
}

export class SendMessageUseCase {
  constructor(
    private messageRepo: IMessageRepository,
    private friendshipRepo: IFriendshipRepository
  ) {}

  async execute({ remetenteId, destinatarioId, conteudo }: IRequest) {
    // 1. Verifica amizade
    const friendship = await this.friendshipRepo.findByUsers(remetenteId, destinatarioId);

    if (!friendship || friendship.status !== FriendshipStatus.ACEITO) {
      throw new Error("Vocês precisam ser amigos (status ACEITO) para trocar mensagens.");
    }

    // 2. Cria mensagem
    const message = new Message();
    message.remetente_id = remetenteId;
    message.destinatario_id = destinatarioId;
    message.conteudo = conteudo;

    return this.messageRepo.create(message);
  }
}