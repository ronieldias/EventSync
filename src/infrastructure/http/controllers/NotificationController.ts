import { Request, Response } from "express";
import { z } from "zod";
import { NotificationRepository } from "../../database/repositories/NotificationRepository";
import { SubscriptionRepository } from "../../database/repositories/SubscriptionRepository";
import { EventRepository } from "../../database/repositories/EventRepository";
import { AppError } from "../../../shared/errors/AppError";

const sendNotificationSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

export class NotificationController {
  // Lista notificações do usuário
  async index(req: Request, res: Response): Promise<Response> {
    const notificationRepository = new NotificationRepository();
    const notifications = await notificationRepository.findByUserId(req.userId);
    return res.json(notifications);
  }

  // Conta notificações não lidas
  async unreadCount(req: Request, res: Response): Promise<Response> {
    const notificationRepository = new NotificationRepository();
    const count = await notificationRepository.countUnreadByUserId(req.userId);
    return res.json({ count });
  }

  // Busca uma notificação específica
  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const notificationRepository = new NotificationRepository();
    const notification = await notificationRepository.findById(id);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== req.userId) {
      throw new AppError("You can only view your own notifications", 403);
    }

    return res.json(notification);
  }

  // Marca uma notificação como lida
  async markAsRead(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const notificationRepository = new NotificationRepository();
    const notification = await notificationRepository.findById(id);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== req.userId) {
      throw new AppError("You can only mark your own notifications as read", 403);
    }

    await notificationRepository.markAsRead(id);
    return res.status(204).send();
  }

  // Marca todas as notificações como lidas
  async markAllAsRead(req: Request, res: Response): Promise<Response> {
    const notificationRepository = new NotificationRepository();
    await notificationRepository.markAllAsRead(req.userId);
    return res.status(204).send();
  }

  // Organizador envia notificação para todos os participantes de um evento
  async sendToEventParticipants(req: Request, res: Response): Promise<Response> {
    const { eventId } = req.params;
    const { title, message } = sendNotificationSchema.parse(req.body);

    const eventRepository = new EventRepository();
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.organizerId !== req.userId) {
      throw new AppError("Only the event organizer can send notifications", 403);
    }

    // Buscar todos os participantes inscritos
    const subscriptionRepository = new SubscriptionRepository();
    const subscriptions = await subscriptionRepository.findByEventId(eventId);

    if (subscriptions.length === 0) {
      throw new AppError("No participants subscribed to this event", 400);
    }

    // Criar notificações para todos os participantes
    const notificationRepository = new NotificationRepository();
    const notifications = subscriptions.map((sub) => ({
      userId: sub.userId,
      eventId,
      title: `[${event.title}] ${title}`,
      message,
      type: "event_message" as const,
    }));

    await notificationRepository.createMany(notifications);

    return res.status(201).json({
      message: `Notificação enviada para ${subscriptions.length} participante(s)`,
    });
  }
}
