import { Router } from "express";
import { RegistrationController } from "../controllers/RegistrationController";
import { authMiddleware } from "../middlewares/auth.middleware";

const registrationRoutes = Router();
const controller = new RegistrationController();

// Listar Minhas Inscrições (Rota Raiz GET)
registrationRoutes.get("/", authMiddleware as any, controller.listMyRegistrations);

// Ações do Organizador
registrationRoutes.patch("/:id/remove", authMiddleware as any, controller.remove);

// Ações do Participante
registrationRoutes.get("/:id/card", authMiddleware as any, controller.getCard);
registrationRoutes.patch("/:id/cancel", authMiddleware as any, controller.cancel);
registrationRoutes.get("/:id/certificate", authMiddleware as any, controller.getCertificate);

export { registrationRoutes };