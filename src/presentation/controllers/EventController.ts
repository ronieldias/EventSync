import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmEventRepository } from "../../persistence/repositories/TypeOrmEventRepository";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { TypeOrmRegistrationRepository } from "../../persistence/repositories/TypeOrmRegistrationRepository"; 
import { CreateEventUseCase } from "../../application/usecases/CreateEventUseCase";
import { ListEventsUseCase } from "../../application/usecases/ListEventsUseCase";
import { PublishEventUseCase } from "../../application/usecases/PublishEventUseCase";
import { UpdateEventUseCase } from "../../application/usecases/UpdateEventUseCase";
import { ToggleInscriptionsUseCase } from "../../application/usecases/ToggleInscriptionsUseCase";
import { ListOrganizerEventsUseCase } from "../../application/usecases/ListOrganizerEventsUseCase"; 
import { GetEventByIdUseCase } from "../../application/usecases/GetEventByIdUseCase"; 
import { ListParticipantEventsUseCase } from "../../application/usecases/ListParticipantEventsUseCase"; 
import { UserRole } from "../../domain/entities/User"; 

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

    const filters = {
      nome: req.query.nome as string,
      categoria: req.query.categoria as string,
      cidade: req.query.cidade as string
    };

    const events = await useCase.execute(filters);
    res.json(events);
  }

  // Obter um evento específico
  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const useCase = new GetEventByIdUseCase(new TypeOrmEventRepository());

    try {
      const event = await useCase.execute(id);
      res.json(event);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
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
    const { status } = req.body; 
    const useCase = new ToggleInscriptionsUseCase(new TypeOrmEventRepository());

    try {
      const result = await useCase.execute({ eventId: id, userId, status });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Lógica unificada para listar eventos criados (Organizer) ou eventos inscritos (User)
  async listMine(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    
    try {
      const userRepo = new TypeOrmUserRepository();
      // Buscamos o usuário para determinar o papel (role)
      const user = await userRepo.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let events;
      
      if (user.role === UserRole.ORGANIZER) {
        // 1. Organização: Lista eventos criados (rascunho, publicado, encerrado, etc.)
        const eventRepo = new TypeOrmEventRepository();
        const useCase = new ListOrganizerEventsUseCase(eventRepo);
        events = await useCase.execute(userId);
      } else {
        // 2. Participante: Lista eventos nos quais está ativamente inscrito
        const registrationRepo = new TypeOrmRegistrationRepository();
        const useCase = new ListParticipantEventsUseCase(registrationRepo);
        events = await useCase.execute(userId);
      }
      
      res.json(events);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}