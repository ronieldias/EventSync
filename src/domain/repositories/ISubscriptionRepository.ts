import { Subscription, CreateSubscriptionInput } from "../entities/Subscription";

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserAndEvent(userId: string, eventId: string): Promise<Subscription | null>;
  findByEventId(eventId: string): Promise<Subscription[]>;
  findByUserId(userId: string): Promise<Subscription[]>;
  countByEventId(eventId: string): Promise<number>;
  create(data: CreateSubscriptionInput): Promise<Subscription>;
  delete(id: string): Promise<boolean>;
  deleteByUserAndEvent(userId: string, eventId: string): Promise<boolean>;
}
