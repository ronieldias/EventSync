import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { CreateReviewUseCase } from "../../application/usecases/CreateReviewUseCase";
import { TypeOrmReviewRepository } from "../../persistence/repositories/TypeOrmReviewRepository";
import { TypeOrmRegistrationRepository } from "../../persistence/repositories/TypeOrmRegistrationRepository";
import { TypeOrmCheckinRepository } from "../../persistence/repositories/TypeOrmCheckinRepository";
import { TypeOrmEventRepository } from "../../persistence/repositories/TypeOrmEventRepository";

export class ReviewController {
  async create(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { eventId } = req.params;
    const { nota, comentario } = req.body;

    const useCase = new CreateReviewUseCase(
      new TypeOrmReviewRepository(),
      new TypeOrmRegistrationRepository(),
      new TypeOrmCheckinRepository(),
      new TypeOrmEventRepository()
    );

    try {
      const result = await useCase.execute({ userId, eventId, nota, comentario });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    const { eventId } = req.params;
    const repo = new TypeOrmReviewRepository();
    const reviews = await repo.listByEvent(eventId);
    res.json(reviews);
  }
}