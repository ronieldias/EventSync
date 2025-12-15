import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { EventStatus } from "../../domain/entities/Event"; // Importar EventStatus

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
    
    // REGRA DE NEGÓCIO: Eventos ENCERRADOS não podem ser alterados
    if (event.status === EventStatus.ENCERRADO) {
      if (data.status && data.status !== EventStatus.ENCERRADO) {
         throw new Error("Eventos encerrados não podem ter seu status alterado.");
      }
    }

    // A regra de não poder alterar outros campos em ENCERRADO não foi pedida, 
    // então o Object.assign abaixo é suficiente para alterar o STATUS
    
    // Mescla os dados atuais com os novos (ignora campos undefined)
    Object.assign(event, data);
    
    return this.eventRepository.update(event);
  }
}