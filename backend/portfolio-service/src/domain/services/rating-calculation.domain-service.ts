import { Rating } from '../value-objects/rating.value-object';
import { Review } from '../entities/review.entity';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Domain Service — Cálculo de rating agregado do especialista.
 * Encapsula regra cross-aggregate: recalcula o rating do perfil público
 * a partir de todas as reviews do especialista.
 */
export class RatingCalculationDomainService {
  /**
   * Recalcula o rating médio de um especialista com base em suas reviews.
   * @param reviews Todas as reviews do especialista
   * @returns Rating recalculado como Value Object
   */
  calculateAverageRating(reviews: Review[]): Rating {
    if (!reviews || reviews.length === 0) {
      return new Rating(0);
    }

    const validReviews = reviews.filter(r => {
      r.validate();
      return true;
    });

    const ratings = validReviews.map(r => r.rating);
    return Rating.average(ratings);
  }

  /**
   * Verifica se o especialista atingiu o threshold de reviews positivas
   * para destaque no perfil público.
   */
  isHighlyRated(reviews: Review[], threshold: number = 4.0): boolean {
    if (reviews.length < 3) return false;
    const avg = this.calculateAverageRating(reviews);
    return avg.getValue() >= threshold;
  }
}
