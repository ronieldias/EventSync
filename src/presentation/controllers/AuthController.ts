import { Request, Response } from "express";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { RegisterUserUseCase } from "../../application/usecases/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/usecases/LoginUserUseCase";

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
}