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

    // Regra de Múltiplos Check-ins
    const checkinsRealizados = await this.checkinRepo.countByRegistrationId(registrationId);
    const limitePermitido = registration.evento.n_checkins_permitidos;

    if (checkinsRealizados >= limitePermitido) {
      throw new Error(`Limite de check-ins atingido para este participante (${checkinsRealizados}/${limitePermitido}).`);
    }

    return this.checkinRepo.create(registration);
  }
}