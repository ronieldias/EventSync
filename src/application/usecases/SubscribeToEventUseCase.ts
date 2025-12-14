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

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Usuário não encontrado.");

    // Verifica se já existe inscrição
    const existing = await this.registrationRepo.findByUserAndEvent(userId, eventId);
    if (existing) throw new Error("Usuário já inscrito neste evento.");

    // Criação direta (sem aprovação)
    const registration = new Registration();
    registration.usuario = user;
    registration.evento = event;
    registration.status = RegistrationStatus.ATIVO;

    return this.registrationRepo.create(registration);
  }
}