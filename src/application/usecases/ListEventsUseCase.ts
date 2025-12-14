import { IEventRepository } from "../../domain/repositories/IEventRepository";

export class ListEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute() {
    return this.eventRepository.listPublicEvents();
  }
}