import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const notificationRoutes = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gerenciamento de notificações
 */

// Todas as rotas requerem autenticação
notificationRoutes.use(authMiddleware);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Listar notificações
 *     description: Retorna todas as notificações do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
notificationRoutes.get("/", notificationController.index);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Contar notificações não lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quantidade de notificações não lidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnreadCountResponse'
 */
notificationRoutes.get("/unread-count", notificationController.unreadCount);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Obter notificação por ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Detalhes da notificação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       403:
 *         description: Sem permissão para ver esta notificação
 *       404:
 *         description: Notificação não encontrada
 */
notificationRoutes.get("/:id", notificationController.show);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marcar notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da notificação
 *     responses:
 *       204:
 *         description: Notificação marcada como lida
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Notificação não encontrada
 */
notificationRoutes.patch("/:id/read", notificationController.markAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Marcar todas como lidas
 *     description: Marca todas as notificações do usuário como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Todas as notificações marcadas como lidas
 */
notificationRoutes.patch("/mark-all-read", notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/event/{eventId}/send:
 *   post:
 *     summary: Enviar notificação aos participantes
 *     description: Organizador envia mensagem para todos os inscritos de um evento
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationInput'
 *     responses:
 *       201:
 *         description: Notificação enviada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificação enviada para 10 participante(s)"
 *       400:
 *         description: Nenhum participante inscrito
 *       403:
 *         description: Apenas o organizador pode enviar notificações
 *       404:
 *         description: Evento não encontrado
 */
notificationRoutes.post("/event/:eventId/send", notificationController.sendToEventParticipants);

export { notificationRoutes };
