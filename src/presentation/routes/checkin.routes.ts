import { Router } from "express";
import { CheckinController } from "../controllers/CheckinController";
import { authMiddleware } from "../middlewares/auth.middleware";

const checkinRoutes = Router();
const controller = new CheckinController();

checkinRoutes.post("/", authMiddleware as any, controller.create);

export { checkinRoutes };