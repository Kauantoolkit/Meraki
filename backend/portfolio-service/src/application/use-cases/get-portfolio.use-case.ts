import { Injectable } from '@nestjs/common';
import { PortfolioItemRepository } from '../../infrastructure/repositories/portfolio-item.repository';
import { Portfolio } from '../../domain/entities/portfolio.entity';

@Injectable()
export class GetPortfolioUseCase {
  constructor(private readonly portfolioRepo: PortfolioItemRepository) {}

  findBySpecialist(specialistId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.findBySpecialist(specialistId);
  }

  create(data: Partial<Portfolio>): Promise<Portfolio> {
    return this.portfolioRepo.save(data);
  }

  async update(id: string, data: Partial<Portfolio>): Promise<Portfolio | null> {
    return this.portfolioRepo.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.portfolioRepo.delete(id);
  }
}
