import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { ICheckinRepository } from "../../domain/repositories/ICheckinRepository";
import { EventStatus } from "../../domain/entities/Event";
import { RegistrationStatus } from "../../domain/entities/Registration";

interface IRequest {
  registrationId: string;
  userId: string;
}

export class GetCertificateDataUseCase {
  constructor(
    private registrationRepo: IRegistrationRepository,
    private checkinRepo: ICheckinRepository
  ) {}

  async execute({ registrationId, userId }: IRequest) {
    const registration = await this.registrationRepo.findById(registrationId);
    if (!registration) throw new Error("Inscrição não encontrada.");

    // Verifica se quem pede é o dono da inscrição
    if (registration.usuario_id !== userId) {
      throw new Error("Acesso negado.");
    }

    const event = registration.evento;

    // Regras de Emissão
    if (event.status !== EventStatus.ENCERRADO) {
      throw new Error("O certificado só estará disponível após o encerramento do evento.");
    }

    if (registration.status === RegistrationStatus.CANCELADO || registration.status === RegistrationStatus.REMOVIDO) {
      throw new Error("Inscrição inválida para emissão de certificado.");
    }

    const checkin = await this.checkinRepo.findByRegistrationId(registration.id);
    if (!checkin) {
      throw new Error("Presença não confirmada. Certificado indisponível.");
    }

    // Retorno dos dados simulados para o PDF
    return {
      certificado_id: `CERT-${registration.id.substring(0, 8).toUpperCase()}`,
      participante_nome: registration.usuario.nome,
      evento_titulo: event.titulo,
      carga_horaria: `${event.carga_horaria} horas`,
      data_evento: event.data_inicio,
      local: event.local,
      emitido_em: new Date(),
      status: "VÁLIDO"
    };
  }
}