import { IEventRepository } from "../../domain/repositories/IEventRepository";

interface IRequest {
  eventId: string;
  userId: string;
  data: any; // Objeto com campos a atualizar (titulo, descricao, local, datas, etc)
}

export class UpdateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute({ eventId, userId, data }: IRequest) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    if (event.organizador_id !== userId) {
      throw new Error("Apenas o organizador pode editar o evento.");
    }

    // Mescla os dados atuais com os novos (ignora campos undefined)
    Object.assign(event, data);
    
    return this.eventRepository.update(event);
  }
}