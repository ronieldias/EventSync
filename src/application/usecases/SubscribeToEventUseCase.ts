import { Registration, RegistrationStatus } from "../../domain/entities/Registration";
import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

interface IRequest {
  userId: string;
  eventId: string;
}

export class SubscribeToEventUseCase {
  constructor(
    private registrationRepo: IRegistrationRepository,
    private eventRepo: IEventRepository,
    private userRepo: IUserRepository
  ) {}

  async execute({ userId, eventId }: IRequest): Promise<Registration> {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    // REGRA 1: Verificar se inscrições estão abertas
    if (!event.inscricao_aberta) {
      throw new Error("As inscrições para este evento estão fechadas pelo organizador.");
    }

    // REGRA 2: Verificar Capacidade
    if (event.max_inscricoes > 0) {
      const activeRegistrations = await this.registrationRepo.listByEvent(eventId);
      if (activeRegistrations.length >= event.max_inscricoes) {
        throw new Error("Vagas esgotadas para este evento.");
      }
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Usuário não encontrado.");

    const existing = await this.registrationRepo.findByUserAndEvent(userId, eventId);
    if (existing) {
        // Se já existe e está cancelada, poderia reativar? Por simplicidade, bloqueamos se ativo.
        if (existing.status === RegistrationStatus.ATIVO) {
            throw new Error("Usuário já inscrito neste evento.");
        }
        // Se quiser permitir re-inscrição de cancelados, adicione lógica aqui
    }

    const registration = new Registration();
    registration.usuario = user;
    registration.evento = event;
    registration.status = RegistrationStatus.ATIVO;

    return this.registrationRepo.create(registration);
  }
}