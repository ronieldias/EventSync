import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { RegistrationController } from "../controllers/RegistrationController";
import { authMiddleware } from "../middlewares/auth.middleware";

const eventRoutes = Router();
const eventController = new EventController();
const registrationController = new RegistrationController();

// Rotas de Evento
eventRoutes.get("/", eventController.list);
eventRoutes.post("/", authMiddleware as any, eventController.create);
eventRoutes.put("/:id", authMiddleware as any, eventController.update); // Edição
eventRoutes.patch("/:id/publish", authMiddleware as any, eventController.publish);
eventRoutes.patch("/:id/toggle-inscriptions", authMiddleware as any, eventController.toggleInscriptions); // Abrir/Fechar

// Rota de Inscrição (Depende do ID do evento)
eventRoutes.post("/:id/register", authMiddleware as any, registrationController.subscribe);

export { eventRoutes };