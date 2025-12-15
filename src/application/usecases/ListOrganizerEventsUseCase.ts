import { IEventRepository } from "../../domain/repositories/IEventRepository";

export class ListOrganizerEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(organizerId: string) {
    // Retorna todos os eventos criados pelo organizador (rascunhos, publicados, encerrados)
    return this.eventRepository.listByOrganizer(organizerId);
  }
}