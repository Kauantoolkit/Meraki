import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { Review } from '../../domain/entities/review.entity';

@Injectable()
export class AddReviewUseCase {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly profileRepo: SpecialistProfileRepository,
  ) {}

  async execute(data: Partial<Review>): Promise<Review> {
    const review = await this.reviewRepo.save(data);

    // Recalcula rating médio no perfil público
    const avg = await this.reviewRepo.averageRating(data.specialistId);
    await this.profileRepo.updateRating(data.specialistId, avg);

    return review;
  }

  findBySpecialist(specialistId: string): Promise<Review[]> {
    return this.reviewRepo.findBySpecialist(specialistId);
  }
}
