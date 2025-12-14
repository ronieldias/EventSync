import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";

export class GetVirtualCardUseCase {
  constructor(private registrationRepo: IRegistrationRepository) {}

  async execute(registrationId: string) {
    const registration = await this.registrationRepo.findById(registrationId);
    if (!registration) throw new Error("Inscrição não encontrada.");

    // Retorna os dados para o Frontend gerar o QR Code
    return {
      inscricao_hash: registration.id, // O próprio ID serve como hash único
      nome_usuario: registration.usuario.nome,
      nome_evento: registration.evento.titulo,
      data_evento: registration.evento.data_inicio,
      status: registration.status
    };
  }
}