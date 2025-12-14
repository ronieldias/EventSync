import { Event, EventStatus } from "../../domain/entities/Event";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserRole } from "../../domain/entities/User";

interface IRequest {
  titulo: string;
  descricao: string;
  local: string;
  data_inicio: Date;
  data_fim: Date;
  carga_horaria: number;
  userId: string;
}

export class CreateEventUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(data: IRequest): Promise<Event> {
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.ORGANIZER) {
      throw new Error("Only organizers can create events");
    }

    const event = new Event();
    Object.assign(event, {
      ...data,
      organizador_id: user.id,
      status: EventStatus.RASCUNHO,
    });

    return this.eventRepository.create(event);
  }
}