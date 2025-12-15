import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { RegisterUserUseCase } from "../../application/usecases/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/usecases/LoginUserUseCase";
import { GetUserProfileUseCase } from "../../application/usecases/GetUserProfileUseCase"; // [NOVO]
import { UpdateUserUseCase } from "../../application/usecases/UpdateUserUseCase"; // [NOVO]

export class AuthController {
  async register(req: Request, res: Response) {
    const repo = new TypeOrmUserRepository();
    const useCase = new RegisterUserUseCase(repo);

    try {
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const repo = new TypeOrmUserRepository();
    const useCase = new LoginUserUseCase(repo);

    try {
      const result = await useCase.execute(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  // Obter Perfil
  async getProfile(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const repo = new TypeOrmUserRepository();
    const useCase = new GetUserProfileUseCase(repo);

    try {
      const profile = await useCase.execute(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Atualizar Perfil
  async updateProfile(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const repo = new TypeOrmUserRepository();
    const useCase = new UpdateUserUseCase(repo);

    try {
      const user = await useCase.execute({ userId, ...req.body });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}