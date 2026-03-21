import { Portfolio } from '../entities/portfolio.entity';

export interface IPortfolioRepository {
  findBySpecialist(specialistId: string): Promise<Portfolio[]>;
  save(portfolio: Partial<Portfolio>): Promise<Portfolio>;
  update(id: string, data: Partial<Portfolio>): Promise<Portfolio | null>;
  delete(id: string): Promise<void>;
}
