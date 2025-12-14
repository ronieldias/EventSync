import { Friendship, FriendshipStatus } from "../../domain/entities/Friendship";
import { IFriendshipRepository } from "../../domain/repositories/IFriendshipRepository";
import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";

interface IRequest {
  solicitanteId: string;
  destinatarioId: string;
}

export class SendFriendRequestUseCase {
  constructor(
    private friendshipRepo: IFriendshipRepository,
    private registrationRepo: IRegistrationRepository
  ) {}

  async execute({ solicitanteId, destinatarioId }: IRequest) {
    if (solicitanteId === destinatarioId) {
      throw new Error("Não pode adicionar a si mesmo.");
    }

    // 1. Verifica se já existe relação
    const existing = await this.friendshipRepo.findByUsers(solicitanteId, destinatarioId);
    if (existing) {
      throw new Error("Solicitação ou amizade já existente.");
    }

    // 2. REGRA CRÍTICA: Verifica interseção de eventos
    const hasIntersection = await this.registrationRepo.checkIntersection(solicitanteId, destinatarioId);
    if (!hasIntersection) {
      throw new Error("Vocês precisam participar do mesmo evento (com inscrição ativa) para iniciar uma amizade.");
    }

    // 3. Cria solicitação
    const friendship = new Friendship();
    friendship.solicitante_id = solicitanteId;
    friendship.destinatario_id = destinatarioId;
    friendship.status = FriendshipStatus.PENDENTE;

    return this.friendshipRepo.create(friendship);
  }
}