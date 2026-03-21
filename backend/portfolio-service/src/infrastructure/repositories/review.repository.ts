import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../domain/entities/review.entity';
import { IReviewRepository } from '../../domain/repositories/i-review.repository';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  save(review: Partial<Review>): Promise<Review> {
    return this.repo.save(this.repo.create(review));
  }

  findBySpecialist(specialistId: string): Promise<Review[]> {
    return this.repo.find({ where: { specialistId }, order: { createdAt: 'DESC' } });
  }

  async averageRating(specialistId: string): Promise<number> {
    const reviews = await this.repo.find({ where: { specialistId } });
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }
}
