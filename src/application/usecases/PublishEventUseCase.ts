import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { EventStatus } from "../../domain/entities/Event";

interface IRequest {
  eventId: string;
  userId: string;
}

export class PublishEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute({ eventId, userId }: IRequest) {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizador_id !== userId) {
      throw new Error("Only the organizer can publish this event");
    }

    event.status = EventStatus.PUBLICADO;
    return this.eventRepository.update(event);
  }
}