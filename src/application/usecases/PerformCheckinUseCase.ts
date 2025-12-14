import { ICheckinRepository } from "../../domain/repositories/ICheckinRepository";
import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { RegistrationStatus } from "../../domain/entities/Registration";

interface IRequest {
  registrationId: string;
  organizerId: string;
}

export class PerformCheckinUseCase {
  constructor(
    private checkinRepo: ICheckinRepository,
    private registrationRepo: IRegistrationRepository
  ) {}

  async execute({ registrationId, organizerId }: IRequest) {
    const registration = await this.registrationRepo.findById(registrationId);
    if (!registration) throw new Error("Inscrição não encontrada.");

    // Validação de Organizador
    if (registration.evento.organizador_id !== organizerId) {
      throw new Error("Apenas o organizador pode realizar o check-in.");
    }

    // Validação de Status
    if (registration.status !== RegistrationStatus.ATIVO) {
      throw new Error(`Check-in bloqueado. Status da inscrição: ${registration.status}`);
    }

    // Verifica se já fez check-in
    const alreadyCheckedIn = await this.checkinRepo.findByRegistrationId(registrationId);
    if (alreadyCheckedIn) {
      throw new Error("Check-in já realizado anteriormente.");
    }

    return this.checkinRepo.create(registration);
  }
}