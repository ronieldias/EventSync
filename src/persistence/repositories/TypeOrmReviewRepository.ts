import { Repository } from "typeorm";
import { AppDataSource } from "../../shared/config/data-source";
import { Review } from "../../domain/entities/Review";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository";

export class TypeOrmReviewRepository implements IReviewRepository {
  private repository: Repository<Review>;

  constructor() {
    this.repository = AppDataSource.getRepository(Review);
  }

  async create(review: Review): Promise<Review> {
    return this.repository.save(review);
  }

  async listByEvent(eventId: string): Promise<Review[]> {
    return this.repository.find({
      where: { evento_id: eventId },
      relations: ["usuario"], // Traz os dados do usuário que comentou
      order: { data: "DESC" }
    });
  }
}