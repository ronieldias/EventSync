import { FriendshipStatus } from "../../domain/entities/Friendship";
import { IFriendshipRepository } from "../../domain/repositories/IFriendshipRepository";

interface IRequest {
  friendshipId: string;
  userId: string;
  action: "accept" | "reject";
}

export class RespondFriendRequestUseCase {
  constructor(private friendshipRepo: IFriendshipRepository) {}

  async execute({ friendshipId, userId, action }: IRequest) {
    const friendship = await this.friendshipRepo.findById(friendshipId);

    if (!friendship) {
      throw new Error("Solicitação não encontrada.");
    }

    if (friendship.destinatario_id !== userId) {
      throw new Error("Apenas o destinatário pode responder a esta solicitação.");
    }

    if (friendship.status !== FriendshipStatus.PENDENTE) {
      throw new Error("Esta solicitação já foi processada.");
    }

    if (action === "reject") {
      // Regra de negócio: Se rejeitar, por enquanto lançamos erro ou poderíamos deletar.
      // Vamos manter simples conforme solicitado.
      throw new Error("Ação de rejeitar não implementada totalmente (sugestão: deletar registro).");
    }

    friendship.status = FriendshipStatus.ACEITO;
    return this.friendshipRepo.update(friendship);
  }
}