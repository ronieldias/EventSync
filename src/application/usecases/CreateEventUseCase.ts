import { Event, EventStatus } from "../../domain/entities/Event";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserRole } from "../../domain/entities/User";

interface IRequest {
  titulo: string;
  descricao: string;
  local: string;
  categoria?: string; //Opcional ou Obrigatório conforme regra
  data_inicio: Date;
  data_fim: Date;
  carga_horaria: number;
  userId: string;
  max_inscricoes?: number;
  n_checkins_permitidos?: number;
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
      categoria: data.categoria || null, //Persistindo a categoria
      max_inscricoes: data.max_inscricoes || 0,
      n_checkins_permitidos: data.n_checkins_permitidos || 1
    });

    return this.eventRepository.create(event);
  }
}