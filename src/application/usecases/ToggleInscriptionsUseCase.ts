import { IEventRepository } from "../../domain/repositories/IEventRepository";

interface IRequest {
  eventId: string;
  userId: string;
  status: boolean; // true = abertas, false = fechadas
}

export class ToggleInscriptionsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute({ eventId, userId, status }: IRequest) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    if (event.organizador_id !== userId) {
      throw new Error("Apenas o organizador pode alterar o status das inscrições.");
    }

    event.inscricao_aberta = status;
    return this.eventRepository.update(event);
  }
}