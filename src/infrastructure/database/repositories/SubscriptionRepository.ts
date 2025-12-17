import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { SubscriptionEntity } from "../entities/SubscriptionEntity";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { Subscription, CreateSubscriptionInput } from "../../../domain/entities/Subscription";

export class SubscriptionRepository implements ISubscriptionRepository {
  private repository: Repository<SubscriptionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SubscriptionEntity);
  }

  async findById(id: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["user", "event"],
    });
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { userId, eventId },
    });
  }

  async findByEventId(eventId: string): Promise<Subscription[]> {
    return this.repository.find({
      where: { eventId },
      relations: ["user"],
      order: { subscribedAt: "ASC" },
    });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.repository.find({
      where: { userId },
      relations: ["event"],
      order: { subscribedAt: "DESC" },
    });
  }

  async countByEventId(eventId: string): Promise<number> {
    return this.repository.count({ where: { eventId } });
  }

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    const subscription = this.repository.create(data);
    return this.repository.save(subscription);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async deleteByUserAndEvent(userId: string, eventId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, eventId });
    return result.affected !== 0;
  }
}
