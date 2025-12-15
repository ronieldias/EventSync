import { Checkin } from "../entities/Checkin";
import { Registration } from "../entities/Registration";

export interface ICheckinRepository {
  create(registration: Registration): Promise<Checkin>;
  findByRegistrationId(registrationId: string): Promise<Checkin | null>;
  // Método para contar check-ins
  countByRegistrationId(registrationId: string): Promise<number>;
}