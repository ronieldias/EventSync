import { Router } from "express";
import { SocialController } from "../controllers/SocialController";
import { authMiddleware } from "../middlewares/auth.middleware";

const socialRoutes = Router();
const controller = new SocialController();

// Listar participantes (Público, para facilitar visualização no app)
socialRoutes.get("/events/:eventId/participants", controller.listParticipants);

// Amizade
socialRoutes.post("/friends/request", authMiddleware as any, controller.sendFriendRequest);
socialRoutes.patch("/friends/:id/respond", authMiddleware as any, controller.respondFriendRequest);

// Mensagens
socialRoutes.post("/messages", authMiddleware as any, controller.sendMessage);
socialRoutes.get("/messages/:otherUserId", authMiddleware as any, controller.listMessages);

export { socialRoutes };