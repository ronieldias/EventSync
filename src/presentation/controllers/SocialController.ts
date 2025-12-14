import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmFriendshipRepository } from "../../persistence/repositories/TypeOrmFriendshipRepository";
import { TypeOrmRegistrationRepository } from "../../persistence/repositories/TypeOrmRegistrationRepository";
import { TypeOrmMessageRepository } from "../../persistence/repositories/TypeOrmMessageRepository";
import { SendFriendRequestUseCase } from "../../application/usecases/SendFriendRequestUseCase";
import { RespondFriendRequestUseCase } from "../../application/usecases/RespondFriendRequestUseCase";
import { SendMessageUseCase } from "../../application/usecases/SendMessageUseCase";
import { ListParticipantsUseCase } from "../../application/usecases/ListParticipantsUseCase";
import { ListMessagesUseCase } from "../../application/usecases/ListMessagesUseCase";

export class SocialController {
  
  async listParticipants(req: Request, res: Response) {
    const { eventId } = req.params;
    const useCase = new ListParticipantsUseCase(new TypeOrmRegistrationRepository());
    
    try {
      const list = await useCase.execute(eventId);
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async sendFriendRequest(req: Request, res: Response) {
    const solicitanteId = (req as AuthenticatedRequest).user!.id;
    const { destinatarioId } = req.body;
    
    const useCase = new SendFriendRequestUseCase(
      new TypeOrmFriendshipRepository(),
      new TypeOrmRegistrationRepository()
    );

    try {
      const result = await useCase.execute({ solicitanteId, destinatarioId });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async respondFriendRequest(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params; // friendshipId
    const { action } = req.body; // 'accept' ou 'reject'

    const useCase = new RespondFriendRequestUseCase(new TypeOrmFriendshipRepository());
    
    try {
      const result = await useCase.execute({ friendshipId: id, userId, action });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async sendMessage(req: Request, res: Response) {
    const remetenteId = (req as AuthenticatedRequest).user!.id;
    const { destinatarioId, conteudo } = req.body;

    const useCase = new SendMessageUseCase(
      new TypeOrmMessageRepository(),
      new TypeOrmFriendshipRepository()
    );

    try {
      const result = await useCase.execute({ remetenteId, destinatarioId, conteudo });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listMessages(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { otherUserId } = req.params;

    const useCase = new ListMessagesUseCase(
      new TypeOrmMessageRepository(),
      new TypeOrmFriendshipRepository()
    );

    try {
      const result = await useCase.execute({ userId, otherUserId });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}