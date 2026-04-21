import { Review } from '../../../src/domain/entities/review.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

function createReview(overrides: Partial<Review> = {}): Review {
  const r = new Review();
  r.id = 'review-1';
  r.specialistId = 'specialist-1';
  r.projectId = 'project-1';
  r.reviewerId = 'reviewer-1';
  r.rating = 4;
  r.comment = 'Bom trabalho';
  Object.assign(r, overrides);
  return r;
}

describe('Review Entity', () => {
  describe('validate()', () => {
    it('deve validar review completa', () => {
      const r = createReview();
      expect(() => r.validate()).not.toThrow();
    });

    it('deve rejeitar rating menor que 1', () => {
      const r = createReview({ rating: 0 });
      expect(() => r.validate()).toThrow(DomainException);
    });

    it('deve rejeitar rating maior que 5', () => {
      const r = createReview({ rating: 6 });
      expect(() => r.validate()).toThrow(DomainException);
    });

    it('deve rejeitar rating decimal', () => {
      const r = createReview({ rating: 3.5 });
      expect(() => r.validate()).toThrow(DomainException);
    });

    it('deve rejeitar sem specialistId', () => {
      const r = createReview({ specialistId: '' });
      expect(() => r.validate()).toThrow(DomainException);
    });

    it('deve rejeitar sem projectId', () => {
      const r = createReview({ projectId: '' });
      expect(() => r.validate()).toThrow(DomainException);
    });

    it('deve rejeitar sem reviewerId', () => {
      const r = createReview({ reviewerId: '' });
      expect(() => r.validate()).toThrow(DomainException);
    });
  });

  describe('isPositive()', () => {
    it('deve retornar true para rating >= 4', () => {
      expect(createReview({ rating: 4 }).isPositive()).toBe(true);
      expect(createReview({ rating: 5 }).isPositive()).toBe(true);
    });

    it('deve retornar false para rating < 4', () => {
      expect(createReview({ rating: 3 }).isPositive()).toBe(false);
      expect(createReview({ rating: 1 }).isPositive()).toBe(false);
    });
  });
});
