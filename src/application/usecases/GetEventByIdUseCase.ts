import { IEventRepository } from "../../domain/repositories/IEventRepository";

export class GetEventByIdUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error("Evento não encontrado.");
    }
    return event;
  }
}