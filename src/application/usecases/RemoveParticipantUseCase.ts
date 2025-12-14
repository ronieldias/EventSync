import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { RegistrationStatus } from "../../domain/entities/Registration";

interface IRequest {
  registrationId: string;
  organizerId: string;
  justificativa: string;
}

export class RemoveParticipantUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute({ registrationId, organizerId, justificativa }: IRequest) {
    // Buscamos a inscrição trazendo os dados do evento para checar o organizador
    // Nota: Precisaremos garantir que o repositório traga a relação 'evento'
    const registration = await this.registrationRepo.findById(registrationId);
    
    if (!registration) throw new Error("Inscrição não encontrada.");
    
    // TypeORM nem sempre traz relações automaticamente. 
    // Assumindo que o findById foi ajustado ou usamos lazy loading. 
    // Para simplificar, vamos assumir que registration.evento.organizador_id está acessível
    // (Ver ajuste no Controller/Repository abaixo se necessário)
    
    // Verificação de segurança (Se o organizador do evento é quem está chamando)
    // Aqui faremos uma validação simplificada. O ideal é carregar a relação no repo.
    if (!registration.evento || registration.evento.organizador_id !== organizerId) {
       // Se o objeto evento não veio carregado, teríamos que buscar. 
       // Vamos assumir que o repositório traz a relação 'evento'.
       throw new Error("Apenas o organizador pode remover participantes.");
    }

    registration.status = RegistrationStatus.REMOVIDO;
    registration.justificativa_remocao = justificativa;

    return this.registrationRepo.update(registration);
  }
}