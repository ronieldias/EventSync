import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { Event } from "../../domain/entities/Event";
import { RegistrationStatus } from "../../domain/entities/Registration";

/**
 * Use case para listar os eventos nos quais um usuário (participante) está ativamente inscrito.
 * Mapeia as inscrições para retornar uma lista de objetos Event.
 */
export class ListParticipantEventsUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute(userId: string): Promise<Event[]> {
    const registrations = await this.registrationRepo.listByUser(userId);

    // Filtra apenas inscrições ativas (status ATIVO) e mapeia para retornar apenas o objeto Event
    // (O repositório TypeOrmRegistrationRepository já está configurado para trazer a relação 'evento')
    return registrations
      .filter(reg => reg.status === RegistrationStatus.ATIVO)
      .map(reg => reg.evento);
  }
}