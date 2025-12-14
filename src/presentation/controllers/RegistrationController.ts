import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TypeOrmRegistrationRepository } from "../../persistence/repositories/TypeOrmRegistrationRepository";
import { TypeOrmEventRepository } from "../../persistence/repositories/TypeOrmEventRepository";
import { TypeOrmUserRepository } from "../../persistence/repositories/TypeOrmUserRepository";
import { TypeOrmCheckinRepository } from "../../persistence/repositories/TypeOrmCheckinRepository";
import { SubscribeToEventUseCase } from "../../application/usecases/SubscribeToEventUseCase";
import { RemoveParticipantUseCase } from "../../application/usecases/RemoveParticipantUseCase";
import { GetVirtualCardUseCase } from "../../application/usecases/GetVirtualCardUseCase";
import { CancelSubscriptionUseCase } from "../../application/usecases/CancelSubscriptionUseCase";
import { GetCertificateDataUseCase } from "../../application/usecases/GetCertificateDataUseCase";
import { ListUserRegistrationsUseCase } from "../../application/usecases/ListUserRegistrationsUseCase";

export class RegistrationController {
  async subscribe(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id: eventId } = req.params;

    const useCase = new SubscribeToEventUseCase(
      new TypeOrmRegistrationRepository(),
      new TypeOrmEventRepository(),
      new TypeOrmUserRepository()
    );

    try {
      const result = await useCase.execute({ userId, eventId });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    const organizerId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params; 
    const { justificativa } = req.body;

    const useCase = new RemoveParticipantUseCase(new TypeOrmRegistrationRepository());

    try {
      const result = await useCase.execute({ registrationId: id, organizerId, justificativa });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCard(req: Request, res: Response) {
    const { id } = req.params;
    const useCase = new GetVirtualCardUseCase(new TypeOrmRegistrationRepository());

    try {
      const cardData = await useCase.execute(id);
      res.json(cardData);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async cancel(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params; 
    const useCase = new CancelSubscriptionUseCase(new TypeOrmRegistrationRepository());

    try {
      const result = await useCase.execute({ registrationId: id, userId });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCertificate(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { id } = req.params;
    const useCase = new GetCertificateDataUseCase(
      new TypeOrmRegistrationRepository(),
      new TypeOrmCheckinRepository()
    );

    try {
      const data = await useCase.execute({ registrationId: id, userId });
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Novo Método
  async listMyRegistrations(req: Request, res: Response) {
    const userId = (req as AuthenticatedRequest).user!.id;
    const useCase = new ListUserRegistrationsUseCase(new TypeOrmRegistrationRepository());

    try {
      const result = await useCase.execute(userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}