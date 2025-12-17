import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const notificationRoutes = Router();
const notificationController = new NotificationController();

// Todas as rotas requerem autenticação
notificationRoutes.use(authMiddleware);

notificationRoutes.get("/", notificationController.index);
notificationRoutes.get("/unread-count", notificationController.unreadCount);
notificationRoutes.get("/:id", notificationController.show);
notificationRoutes.patch("/:id/read", notificationController.markAsRead);
notificationRoutes.patch("/mark-all-read", notificationController.markAllAsRead);
notificationRoutes.post("/event/:eventId/send", notificationController.sendToEventParticipants);

export { notificationRoutes };
