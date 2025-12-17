import { Request, Response } from "express";
import { z } from "zod";
import { EventRepository } from "../../database/repositories/EventRepository";
import { SubscriptionRepository } from "../../database/repositories/SubscriptionRepository";
import { UserRepository } from "../../database/repositories/UserRepository";
import { NotificationRepository } from "../../database/repositories/NotificationRepository";
import { EventRemovalRepository } from "../../database/repositories/EventRemovalRepository";
import { AppError } from "../../../shared/errors/AppError";
import { EventStatus } from "../../../domain/entities/Event";

const categoryEnum = z.enum(["palestra", "seminario", "mesa_redonda", "oficina", "workshop", "conferencia", "outro", "sem_categoria"]);

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: categoryEnum.default("sem_categoria"),
  banner: z.string().optional(),
  date: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  location: z.string().min(3),
  workload: z.number().int().min(0).default(0),
  capacity: z.number().int().positive(),
});

const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: categoryEnum.optional(),
  banner: z.string().optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  location: z.string().min(3).optional(),
  workload: z.number().int().min(0).optional(),
  capacity: z.number().int().positive().optional(),
});

const changeStatusSchema = z.object({
  status: z.enum(["draft", "published", "in_progress", "finished", "cancelled"]),
});

const EDITABLE_STATUSES: EventStatus[] = ["draft", "published", "in_progress"];
const NON_EDITABLE_STATUSES: EventStatus[] = ["finished", "cancelled"];
const DELETABLE_STATUSES: EventStatus[] = ["draft"];

export class EventController {
  // Lista eventos públicos (published, in_progress, finished)
  async index(_req: Request, res: Response): Promise<Response> {
    const eventRepository = new EventRepository();
    const events = await eventRepository.findPublic();
    return res.json(events);
  }

  // Exibe um evento específico
  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Eventos em rascunho só podem ser vistos pelo organizador
    if (event.status === "draft") {
      if (!req.userId || event.organizerId !== req.userId) {
        throw new AppError("Event not found", 404);
      }
    }

    return res.json(event);
  }

  // Cria um novo evento (apenas organizadores)
  async create(req: Request, res: Response): Promise<Response> {
    const data = createEventSchema.parse(req.body);

    // Validar que a data do evento não é no passado
    const now = new Date();
    if (data.date < now) {
      throw new AppError("A data do evento não pode ser no passado", 400);
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(req.userId);

    if (!user || user.role !== "organizer") {
      throw new AppError("Only organizers can create events", 403);
    }

    const eventRepository = new EventRepository();
    const event = await eventRepository.create({
      ...data,
      organizerId: req.userId,
    });

    return res.status(201).json(event);
  }

  // Atualiza um evento (apenas em estados editáveis)
  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const data = updateEventSchema.parse(req.body);

    const eventRepository = new EventRepository();
    const existingEvent = await eventRepository.findById(id);

    if (!existingEvent) {
      throw new AppError("Event not found", 404);
    }

    if (existingEvent.organizerId !== req.userId) {
      throw new AppError("You can only update your own events", 403);
    }

    if (NON_EDITABLE_STATUSES.includes(existingEvent.status)) {
      throw new AppError(`Não é possível editar evento com status '${existingEvent.status}'`, 400);
    }

    // Validar que a data do evento não é no passado
    if (data.date) {
      const now = new Date();
      if (data.date < now) {
        throw new AppError("A data do evento não pode ser no passado", 400);
      }
    }

    const event = await eventRepository.update(id, data);
    return res.json(event);
  }

  // Deleta um evento (apenas em rascunho)
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const eventRepository = new EventRepository();
    const existingEvent = await eventRepository.findById(id);

    if (!existingEvent) {
      throw new AppError("Event not found", 404);
    }

    if (existingEvent.organizerId !== req.userId) {
      throw new AppError("You can only delete your own events", 403);
    }

    if (!DELETABLE_STATUSES.includes(existingEvent.status)) {
      throw new AppError("Somente eventos em rascunho podem ser excluídos", 400);
    }

    await eventRepository.delete(id);
    return res.status(204).send();
  }

  // Lista eventos do organizador logado
  async myEvents(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const user = await userRepository.findById(req.userId);

    if (!user || user.role !== "organizer") {
      throw new AppError("Only organizers can access this resource", 403);
    }

    const eventRepository = new EventRepository();
    const events = await eventRepository.findByOrganizerId(req.userId);
    return res.json(events);
  }

  // Altera o status do evento
  async changeStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { status: newStatus } = changeStatusSchema.parse(req.body);

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.organizerId !== req.userId) {
      throw new AppError("You can only change status of your own events", 403);
    }

    // Validar transições de status permitidas
    // Rascunho não pode ser cancelado, apenas excluído
    const validTransitions: Record<EventStatus, EventStatus[]> = {
      draft: ["published"],
      published: ["in_progress", "cancelled", "draft"],
      in_progress: ["finished", "cancelled"],
      finished: [],
      cancelled: [],
    };

    if (!validTransitions[event.status].includes(newStatus)) {
      throw new AppError(
        `Cannot transition from '${event.status}' to '${newStatus}'`,
        400
      );
    }

    // Fechar inscrições automaticamente se entrar em estado não editável
    const updateData: { status: EventStatus; subscriptionsOpen?: boolean } = {
      status: newStatus,
    };

    if (["draft", "finished", "cancelled"].includes(newStatus)) {
      updateData.subscriptionsOpen = false;
    }

    const updatedEvent = await eventRepository.update(id, updateData);
    return res.json(updatedEvent);
  }

  // Abre/fecha inscrições
  async toggleSubscriptions(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { open } = z.object({ open: z.boolean() }).parse(req.body);

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.organizerId !== req.userId) {
      throw new AppError("You can only manage your own events", 403);
    }

    // Só pode abrir/fechar inscrições em published ou in_progress
    if (!["published", "in_progress"].includes(event.status)) {
      throw new AppError(
        `Cannot manage subscriptions in '${event.status}' status`,
        400
      );
    }

    const updatedEvent = await eventRepository.update(id, {
      subscriptionsOpen: open,
    });

    return res.json(updatedEvent);
  }

  // Inscrever-se em um evento
  async subscribe(req: Request, res: Response): Promise<Response> {
    const { id: eventId } = req.params;

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (!["published", "in_progress"].includes(event.status)) {
      throw new AppError("Event is not available for subscription", 400);
    }

    if (!event.subscriptionsOpen) {
      throw new AppError("Subscriptions are closed for this event", 400);
    }

    // Verificar se o usuário foi removido do evento
    const eventRemovalRepository = new EventRemovalRepository();
    const wasRemoved = await eventRemovalRepository.isUserRemovedFromEvent(req.userId, eventId);
    if (wasRemoved) {
      throw new AppError("Você foi removido deste evento e não pode se inscrever novamente", 403);
    }

    const subscriptionRepository = new SubscriptionRepository();

    // Verificar se já está inscrito
    const existingSubscription = await subscriptionRepository.findByUserAndEvent(
      req.userId,
      eventId
    );

    if (existingSubscription) {
      throw new AppError("You are already subscribed to this event", 400);
    }

    // Verificar capacidade
    const subscriptionCount = await subscriptionRepository.countByEventId(eventId);
    if (subscriptionCount >= event.capacity) {
      // Fechar inscrições automaticamente
      await eventRepository.update(eventId, { subscriptionsOpen: false });
      throw new AppError("Event is full", 400);
    }

    const subscription = await subscriptionRepository.create({
      userId: req.userId,
      eventId,
    });

    // Verificar se atingiu capacidade após inscrição
    const newCount = await subscriptionRepository.countByEventId(eventId);
    if (newCount >= event.capacity) {
      await eventRepository.update(eventId, { subscriptionsOpen: false });
    }

    return res.status(201).json(subscription);
  }

  // Cancelar inscrição
  // Participante pode cancelar se:
  // - Inscrições estão abertas
  // - Evento está publicado ou em andamento
  async unsubscribe(req: Request, res: Response): Promise<Response> {
    const { id: eventId } = req.params;

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (!["published", "in_progress"].includes(event.status)) {
      throw new AppError("Não é possível cancelar inscrição de um evento finalizado ou cancelado", 400);
    }

    if (!event.subscriptionsOpen) {
      throw new AppError("Não é possível cancelar inscrição enquanto as inscrições estão fechadas", 400);
    }

    const subscriptionRepository = new SubscriptionRepository();
    const deleted = await subscriptionRepository.deleteByUserAndEvent(
      req.userId,
      eventId
    );

    if (!deleted) {
      throw new AppError("You are not subscribed to this event", 400);
    }

    return res.status(204).send();
  }

  // Listar inscritos de um evento
  async listSubscribers(req: Request, res: Response): Promise<Response> {
    const { id: eventId } = req.params;

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const subscriptionRepository = new SubscriptionRepository();
    const subscriptions = await subscriptionRepository.findByEventId(eventId);

    const subscribers = subscriptions.map((sub: { user: { id: string; name: string; email: string }; subscribedAt: Date }) => ({
      id: sub.user.id,
      name: sub.user.name,
      email: sub.user.email,
      subscribedAt: sub.subscribedAt,
    }));

    return res.json(subscribers);
  }

  // Listar minhas inscrições
  async mySubscriptions(req: Request, res: Response): Promise<Response> {
    const subscriptionRepository = new SubscriptionRepository();
    const subscriptions = await subscriptionRepository.findByUserId(req.userId);
    return res.json(subscriptions);
  }

  // Remover um participante do evento (apenas organizador)
  async removeSubscriber(req: Request, res: Response): Promise<Response> {
    const { id: eventId, subscriberId } = req.params;
    const { reason } = z.object({ reason: z.string().min(5) }).parse(req.body);

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.organizerId !== req.userId) {
      throw new AppError("Only the event organizer can remove subscribers", 403);
    }

    if (!["published", "in_progress"].includes(event.status)) {
      throw new AppError("Cannot remove subscribers from this event", 400);
    }

    const subscriptionRepository = new SubscriptionRepository();
    const deleted = await subscriptionRepository.deleteByUserAndEvent(
      subscriberId,
      eventId
    );

    if (!deleted) {
      throw new AppError("Subscriber not found in this event", 404);
    }

    // Registrar a remoção para bloquear reinscrição
    const eventRemovalRepository = new EventRemovalRepository();
    await eventRemovalRepository.create({
      userId: subscriberId,
      eventId,
      reason,
    });

    // Enviar notificação ao participante removido
    const notificationRepository = new NotificationRepository();
    await notificationRepository.create({
      userId: subscriberId,
      eventId,
      title: `Você foi removido do evento "${event.title}"`,
      message: `Motivo informado pelo organizador: ${reason}`,
      type: "removal",
    });

    return res.status(204).send();
  }
}
