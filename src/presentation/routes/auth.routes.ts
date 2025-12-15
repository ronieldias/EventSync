import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/auth.middleware"; // Importe o middleware

const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);

// [NOVO] Rotas de Perfil (Protegidas)
authRoutes.get("/profile", authMiddleware as any, controller.getProfile.bind(controller));
authRoutes.put("/profile", authMiddleware as any, controller.updateProfile.bind(controller));

export { authRoutes };