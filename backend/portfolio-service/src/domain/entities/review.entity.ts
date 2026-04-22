import { DomainException } from '../exceptions/domain.exception';

export class Review {
  id: string;
  specialistId: string;
  projectId: string;
  reviewerId: string;
  rating: number; // 1–5
  comment: string;
  createdAt: Date;

  validate(): void {
    if (!Number.isInteger(this.rating) || this.rating < 1 || this.rating > 5) {
      throw new DomainException('Rating deve ser um inteiro entre 1 e 5');
    }
    if (!this.specialistId || !this.projectId || !this.reviewerId) {
      throw new DomainException('Review precisa de specialistId, projectId e reviewerId');
    }
  }

  isPositive(): boolean {
    return this.rating >= 4;
  }
}
