import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmEventRepository } from "../../persistence/repositories/TypeOrmEventRepository";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { CreateEventUseCase } from "../../application/usecases/CreateEventUseCase";
import { ListEventsUseCase } from "../../application/usecases/ListEventsUseCase";
import { PublishEventUseCase } from "../../application/usecases/PublishEventUseCase";
import { UpdateEventUseCase } from "../../application/usecases/UpdateEventUseCase";
import { ToggleInscriptionsUseCase } from "../../application/usecases/ToggleInscriptionsUseCase";

export class EventController {
  async create(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
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

  // --- Novos Métodos ---

  async update(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params;
    const useCase = new UpdateEventUseCase(new TypeOrmEventRepository());

    try {
      const result = await useCase.execute({ eventId: id, userId, data: req.body });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleInscriptions(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params;
    const { status } = req.body; // espera um boolean: true/false
    const useCase = new ToggleInscriptionsUseCase(new TypeOrmEventRepository());

    try {
      const result = await useCase.execute({ eventId: id, userId, status });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}