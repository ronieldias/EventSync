import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";

const eventRoutes = Router();
const eventController = new EventController();

// Rotas públicas (ordem importa: específicas antes de parametrizadas)
eventRoutes.get("/", eventController.index);

// Rotas autenticadas com paths específicos (antes de /:id)
eventRoutes.get("/organizer/my-events", authMiddleware, eventController.myEvents);
eventRoutes.get("/participant/my-subscriptions", authMiddleware, eventController.mySubscriptions);

// Rotas públicas parametrizadas
eventRoutes.get("/:id", optionalAuthMiddleware, eventController.show);
eventRoutes.get("/:id/subscribers", eventController.listSubscribers);

// Rotas autenticadas parametrizadas
eventRoutes.post("/", authMiddleware, eventController.create);
eventRoutes.put("/:id", authMiddleware, eventController.update);
eventRoutes.delete("/:id", authMiddleware, eventController.delete);
eventRoutes.patch("/:id/status", authMiddleware, eventController.changeStatus);
eventRoutes.patch("/:id/subscriptions", authMiddleware, eventController.toggleSubscriptions);
eventRoutes.post("/:id/subscribe", authMiddleware, eventController.subscribe);
eventRoutes.delete("/:id/subscribe", authMiddleware, eventController.unsubscribe);
eventRoutes.delete("/:id/subscribers/:subscriberId", authMiddleware, eventController.removeSubscriber);

export { eventRoutes };
