import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../../domain/entities/portfolio.entity';
import { IPortfolioRepository } from '../../domain/repositories/i-portfolio.repository';

@Injectable()
export class PortfolioItemRepository implements IPortfolioRepository {
  constructor(
    @InjectRepository(Portfolio)
    private readonly repo: Repository<Portfolio>,
  ) {}

  findBySpecialist(specialistId: string): Promise<Portfolio[]> {
    return this.repo.find({ where: { specialistId, isPublished: true }, order: { createdAt: 'DESC' } });
  }

  save(portfolio: Partial<Portfolio>): Promise<Portfolio> {
    return this.repo.save(this.repo.create(portfolio));
  }

  async update(id: string, data: Partial<Portfolio>): Promise<Portfolio | null> {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
