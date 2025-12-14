import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";

export class ListUserRegistrationsUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute(userId: string) {
    const registrations = await this.registrationRepo.listByUser(userId);

    // Mapeamos para retornar um JSON limpo e amigável para o frontend
    return registrations.map(reg => ({
      inscricao_id: reg.id,
      status: reg.status,
      data_inscricao: reg.data_inscricao,
      justificativa: reg.justificativa_remocao, // Caso tenha sido removido
      evento: {
        id: reg.evento.id,
        titulo: reg.evento.titulo,
        data_inicio: reg.evento.data_inicio,
        data_fim: reg.evento.data_fim,
        local: reg.evento.local,
        status_evento: reg.evento.status,
        banner: reg.evento.banner_url
      }
    }));
  }
}