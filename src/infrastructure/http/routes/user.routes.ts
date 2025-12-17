import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authMiddleware);

userRoutes.get("/", userController.index);
userRoutes.get("/me", userController.me);
userRoutes.get("/:id", userController.show);
userRoutes.put("/:id", userController.update);
userRoutes.delete("/:id", userController.delete);

export { userRoutes };
