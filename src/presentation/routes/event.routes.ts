import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RegistrationController } from "../controllers/RegistrationController";

const eventRoutes = Router();
const controller = new EventController();
const registrationController = new RegistrationController();

eventRoutes.get("/", controller.list);
eventRoutes.post("/", authMiddleware as any, controller.create);
eventRoutes.patch("/:id/publish", authMiddleware as any, controller.publish);
eventRoutes.post("/:id/register", authMiddleware as any, registrationController.subscribe);

export { eventRoutes };