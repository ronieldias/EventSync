import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { IEventRepository } from "../../domain/repositories/IEventRepository";

interface IRequest {
  eventId: string;
  userId: string;
}

export class ListEventRegistrationsUseCase {
  constructor(
    private registrationRepo: IRegistrationRepository,
    private eventRepo: IEventRepository
  ) {}

  async execute({ eventId, userId }: IRequest) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    if (event.organizador_id !== userId) {
      throw new Error("Apenas o organizador pode ver a lista completa de inscrições.");
    }

    return this.registrationRepo.listByEvent(eventId);
  }
}