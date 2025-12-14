import { Review } from "../../domain/entities/Review";
import { EventStatus } from "../../domain/entities/Event";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository";
import { IRegistrationRepository } from "../../domain/repositories/IRegistrationRepository";
import { ICheckinRepository } from "../../domain/repositories/ICheckinRepository";
import { IEventRepository } from "../../domain/repositories/IEventRepository";

interface IRequest {
  userId: string;
  eventId: string;
  nota: number;
  comentario: string;
}

export class CreateReviewUseCase {
  constructor(
    private reviewRepo: IReviewRepository,
    private registrationRepo: IRegistrationRepository,
    private checkinRepo: ICheckinRepository,
    private eventRepo: IEventRepository
  ) {}

  async execute({ userId, eventId, nota, comentario }: IRequest) {
    // 1. Validar Evento
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    if (event.status !== EventStatus.ENCERRADO) {
      throw new Error("Você só pode avaliar eventos que já foram encerrados.");
    }

    // 2. Validar Inscrição
    const registration = await this.registrationRepo.findByUserAndEvent(userId, eventId);
    if (!registration) throw new Error("Você não estava inscrito neste evento.");

    // 3. Validar Check-in (Presença confirmada)
    const checkin = await this.checkinRepo.findByRegistrationId(registration.id);
    if (!checkin) throw new Error("Você não pode avaliar pois sua presença não foi confirmada (Check-in não realizado).");

    // 4. Criar Review
    const review = new Review();
    review.usuario_id = userId;
    review.evento_id = eventId;
    review.nota = nota;
    review.comentario = comentario;

    return this.reviewRepo.create(review);
  }
}