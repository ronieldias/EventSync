import { Review } from "../entities/Review";

export interface IReviewRepository {
  create(review: Review): Promise<Review>;
  listByEvent(eventId: string): Promise<Review[]>;
}