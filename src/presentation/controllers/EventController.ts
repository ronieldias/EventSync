import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmEventRepository } from "../../persistence/repositories/TypeOrmEventRepository";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { CreateEventUseCase } from "../../application/usecases/CreateEventUseCase";
import { ListEventsUseCase } from "../../application/usecases/ListEventsUseCase";
import { PublishEventUseCase } from "../../application/usecases/PublishEventUseCase";

export class EventController {
  async create(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id; // Pega do middleware
    
    const eventRepo = new TypeOrmEventRepository();
    const userRepo = new TypeOrmUserRepository();
    const useCase = new CreateEventUseCase(eventRepo, userRepo);

    try {
      const event = await useCase.execute({ ...req.body, userId });
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    const eventRepo = new TypeOrmEventRepository();
    const useCase = new ListEventsUseCase(eventRepo);

    const events = await useCase.execute();
    res.json(events);
  }

  async publish(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params;

    const eventRepo = new TypeOrmEventRepository();
    const useCase = new PublishEventUseCase(eventRepo);

    try {
      const event = await useCase.execute({ eventId: id, userId });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}