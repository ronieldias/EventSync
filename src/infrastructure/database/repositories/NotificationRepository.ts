import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { NotificationEntity } from "../entities/NotificationEntity";
import { Notification, CreateNotificationInput } from "../../../domain/entities/Notification";

export class NotificationRepository {
  private repository: Repository<NotificationEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(NotificationEntity);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["event"],
    });
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId },
      relations: ["event"],
      order: { createdAt: "DESC" },
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId, isRead: false },
      relations: ["event"],
      order: { createdAt: "DESC" },
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }

  async create(data: CreateNotificationInput): Promise<Notification> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  async createMany(notifications: CreateNotificationInput[]): Promise<Notification[]> {
    const entities = this.repository.create(notifications);
    return this.repository.save(entities);
  }

  async markAsRead(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isRead: true });
    return result.affected !== 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await this.repository.update({ userId, isRead: false }, { isRead: true });
    return result.affected !== 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
