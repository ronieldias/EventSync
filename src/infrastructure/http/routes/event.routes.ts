import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";

const eventRoutes = Router();
const eventController = new EventController();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gerenciamento de eventos
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Listar eventos públicos
 *     description: Retorna eventos com status published, in_progress ou finished
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
eventRoutes.get("/", eventController.index);

/**
 * @swagger
 * /events/organizer/my-events:
 *   get:
 *     summary: Listar eventos do organizador
 *     description: Retorna todos os eventos criados pelo organizador autenticado
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos do organizador
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       403:
 *         description: Apenas organizadores podem acessar
 */
eventRoutes.get("/organizer/my-events", authMiddleware, eventController.myEvents);

/**
 * @swagger
 * /events/participant/my-subscriptions:
 *   get:
 *     summary: Listar minhas inscrições
 *     description: Retorna todos os eventos em que o usuário está inscrito
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscrições
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 */
eventRoutes.get("/participant/my-subscriptions", authMiddleware, eventController.mySubscriptions);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obter evento por ID
 *     description: Eventos em rascunho só são visíveis para o organizador
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Detalhes do evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 */
eventRoutes.get("/:id", optionalAuthMiddleware, eventController.show);

/**
 * @swagger
 * /events/{id}/subscribers:
 *   get:
 *     summary: Listar inscritos do evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Lista de inscritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscriber'
 *       404:
 *         description: Evento não encontrado
 */
eventRoutes.get("/:id/subscribers", eventController.listSubscribers);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Criar novo evento
 *     description: Apenas organizadores podem criar eventos
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Apenas organizadores podem criar eventos
 */
eventRoutes.post("/", authMiddleware, eventController.create);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Atualizar evento
 *     description: Apenas o organizador pode atualizar. Não é possível editar eventos finalizados ou cancelados.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/UpdateEventInput'
 *     responses:
 *       200:
 *         description: Evento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Sem permissão para atualizar
 *       404:
 *         description: Evento não encontrado
 */
eventRoutes.put("/:id", authMiddleware, eventController.update);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Excluir evento
 *     description: Apenas eventos em rascunho podem ser excluídos
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Evento excluído com sucesso
 *       400:
 *         description: Somente eventos em rascunho podem ser excluídos
 *       403:
 *         description: Sem permissão para excluir
 *       404:
 *         description: Evento não encontrado
 */
eventRoutes.delete("/:id", authMiddleware, eventController.delete);

/**
 * @swagger
 * /events/{id}/status:
 *   patch:
 *     summary: Alterar status do evento
 *     description: |
 *       Transições permitidas:
 *       - draft → published
 *       - published → in_progress, cancelled, draft
 *       - in_progress → finished, cancelled
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/ChangeStatusInput'
 *     responses:
 *       200:
 *         description: Status alterado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Transição de status inválida
 *       403:
 *         description: Sem permissão
 */
eventRoutes.patch("/:id/status", authMiddleware, eventController.changeStatus);

/**
 * @swagger
 * /events/{id}/subscriptions:
 *   patch:
 *     summary: Abrir/fechar inscrições
 *     description: Só funciona para eventos publicados ou em andamento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             $ref: '#/components/schemas/ToggleSubscriptionsInput'
 *     responses:
 *       200:
 *         description: Inscrições atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Não é possível gerenciar inscrições neste status
 *       403:
 *         description: Sem permissão
 */
eventRoutes.patch("/:id/subscriptions", authMiddleware, eventController.toggleSubscriptions);

/**
 * @swagger
 * /events/{id}/subscribe:
 *   post:
 *     summary: Inscrever-se no evento
 *     description: Requer evento publicado/em andamento com inscrições abertas e vagas disponíveis
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       201:
 *         description: Inscrição realizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Inscrições fechadas, evento lotado ou já inscrito
 *       403:
 *         description: Usuário foi removido do evento
 */
eventRoutes.post("/:id/subscribe", authMiddleware, eventController.subscribe);

/**
 * @swagger
 * /events/{id}/subscribe:
 *   delete:
 *     summary: Cancelar inscrição
 *     description: Só é possível cancelar se evento estiver publicado ou em andamento e inscrições abertas
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Inscrição cancelada
 *       400:
 *         description: Não é possível cancelar inscrição neste momento
 */
eventRoutes.delete("/:id/subscribe", authMiddleware, eventController.unsubscribe);

/**
 * @swagger
 * /events/{id}/subscribers/{subscriberId}:
 *   delete:
 *     summary: Remover participante
 *     description: Organizador remove um participante do evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do evento
 *       - in: path
 *         name: subscriberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do participante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveSubscriberInput'
 *     responses:
 *       204:
 *         description: Participante removido
 *       403:
 *         description: Apenas o organizador pode remover participantes
 *       404:
 *         description: Evento ou participante não encontrado
 */
eventRoutes.delete("/:id/subscribers/:subscriberId", authMiddleware, eventController.removeSubscriber);

export { eventRoutes };
