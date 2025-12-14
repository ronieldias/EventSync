import { Router } from "express";
import { RegistrationController } from "../controllers/RegistrationController";
import { authMiddleware } from "../middlewares/auth.middleware";

const registrationRoutes = Router();
const controller = new RegistrationController();

// Remover participante (apenas organizador)
registrationRoutes.patch("/:id/remove", authMiddleware as any, controller.remove);

// Cartão Virtual (público ou privado? Se for privado, adicione o middleware)
registrationRoutes.get("/:id/card", authMiddleware as any, controller.getCard);

export { registrationRoutes };