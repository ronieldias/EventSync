import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";

export class ListParticipantsUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute(eventId: string) {
    const registrations = await this.registrationRepo.listByEvent(eventId);

    // Filtra usuários que permitiram visibilidade
    // Mapeia para retornar apenas dados seguros (DTO simplificado)
    return registrations
      .filter((r) => r.usuario.visibilidade_participacao)
      .map((r) => ({
        inscricao_id: r.id,
        usuario_id: r.usuario.id,
        nome: r.usuario.nome,
        cidade: r.usuario.cidade,
        foto_url: r.usuario.foto_url,
        bio: r.usuario.bio,
      }));
  }
}