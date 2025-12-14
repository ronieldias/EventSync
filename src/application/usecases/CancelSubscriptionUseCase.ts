import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { RegistrationStatus } from "../../domain/entities/Registration";

interface IRequest {
  registrationId: string;
  userId: string;
}

export class CancelSubscriptionUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute({ registrationId, userId }: IRequest) {
    const registration = await this.registrationRepo.findById(registrationId);
    if (!registration) throw new Error("Inscrição não encontrada.");

    // Valida se a inscrição pertence ao usuário logado
    if (registration.usuario_id !== userId) {
      throw new Error("Você só pode cancelar sua própria inscrição.");
    }

    registration.status = RegistrationStatus.CANCELADO;
    
    return this.registrationRepo.update(registration);
  }
}