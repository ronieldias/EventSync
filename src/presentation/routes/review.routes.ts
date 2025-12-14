import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middlewares/auth.middleware";

const reviewRoutes = Router();
const controller = new ReviewController();

// Avaliar evento (POST /reviews/events/:eventId)
reviewRoutes.post("/events/:eventId", authMiddleware as any, controller.create);

// Listar avaliações (GET /reviews/events/:eventId)
reviewRoutes.get("/events/:eventId", controller.list);

export { reviewRoutes };