import { Registration } from "../entities/Registration";

export interface IRegistrationRepository {
  create(registration: Registration): Promise<Registration>;
  findByUserAndEvent(userId: string, eventId: string): Promise<Registration | null>;
  findById(id: string): Promise<Registration | null>;
  update(registration: Registration): Promise<Registration>;
  
  // Métodos Sociais
  checkIntersection(userA: string, userB: string): Promise<boolean>;
  listByEvent(eventId: string): Promise<Registration[]>;

  // Novo método para listar inscrições do usuário
  listByUser(userId: string): Promise<Registration[]>;
}