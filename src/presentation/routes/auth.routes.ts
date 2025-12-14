import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);

export { authRoutes };