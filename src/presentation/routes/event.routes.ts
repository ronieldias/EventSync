import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { RegistrationController } from "../controllers/RegistrationController";
import { authMiddleware } from "../middlewares/auth.middleware";

const eventRoutes = Router();
const eventController = new EventController();
const registrationController = new RegistrationController();

// 1. Rotas Gerais (Sem ID)
eventRoutes.get("/", eventController.list); // Feed público com filtros
eventRoutes.get("/my-events", authMiddleware as any, eventController.listMine.bind(eventController));
eventRoutes.post("/", authMiddleware as any, eventController.create);

// 2. Rotas Específicas com ID
// IMPORTANTE: Rotas específicas com :id devem vir depois de rotas fixas como /my-events

// Detalhes do Evento
eventRoutes.get("/:id", eventController.getOne);

// PUT/PATCH Ações no Evento
eventRoutes.put("/:id", authMiddleware as any, eventController.update); 
eventRoutes.patch("/:id/publish", authMiddleware as any, eventController.publish);
eventRoutes.patch("/:id/toggle-inscriptions", authMiddleware as any, eventController.toggleInscriptions); 

// 3. Sub-recursos (Inscrições relacionadas ao evento)
eventRoutes.post("/:id/register", authMiddleware as any, registrationController.subscribe);

// Organizador ver todos os inscritos
eventRoutes.get("/:id/registrations", authMiddleware as any, registrationController.listByEvent.bind(registrationController));

export { eventRoutes };