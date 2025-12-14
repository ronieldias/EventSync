import { Registration } from "../entities/Registration";

export interface IRegistrationRepository {
  create(registration: Registration): Promise<Registration>;
  findByUserAndEvent(userId: string, eventId: string): Promise<Registration | null>;
  findById(id: string): Promise<Registration | null>;
  update(registration: Registration): Promise<Registration>;
  
  // Novos métodos para o módulo Social
  checkIntersection(userA: string, userB: string): Promise<boolean>;
  listByEvent(eventId: string): Promise<Registration[]>;
}