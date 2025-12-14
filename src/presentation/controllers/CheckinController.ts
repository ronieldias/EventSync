import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmCheckinRepository } from "../../persistence/repositories/TypeOrmCheckinRepository";
import { TypeOrmRegistrationRepository } from "../../persistence/repositories/TypeOrmRegistrationRepository";
import { PerformCheckinUseCase } from "../../application/usecases/PerformCheckinUseCase";

export class CheckinController {
  async create(req: Request, res: Response) {
    const organizerId = (req as AuthenticatedRequest).user!.id;
    const { registration_id } = req.body;

    const useCase = new PerformCheckinUseCase(
      new TypeOrmCheckinRepository(),
      new TypeOrmRegistrationRepository()
    );

    try {
      const result = await useCase.execute({ registrationId: registration_id, organizerId });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}