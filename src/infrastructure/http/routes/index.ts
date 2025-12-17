import { Router } from "express";
import { userRoutes } from "./user.routes";
import { eventRoutes } from "./event.routes";
import { authRoutes } from "./auth.routes";
import { notificationRoutes } from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/notifications", notificationRoutes);

export { router };
