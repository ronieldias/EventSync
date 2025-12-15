import { IEventRepository } from "../../domain/repositories/IEventRepository";

export class ListEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  //Recebe filtros opcionais
  async execute(filters?: { nome?: string; categoria?: string; cidade?: string }) {
    return this.eventRepository.listPublicEvents(filters);
  }
}