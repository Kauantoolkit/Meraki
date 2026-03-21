import { Review } from '../entities/review.entity';

export interface IReviewRepository {
  save(review: Partial<Review>): Promise<Review>;
  findBySpecialist(specialistId: string): Promise<Review[]>;
  averageRating(specialistId: string): Promise<number>;
}
