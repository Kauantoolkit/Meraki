import { EntitySchema } from 'typeorm';
import { Portfolio } from '../../../domain/entities/portfolio.entity';

export const PortfolioSchema = new EntitySchema<Portfolio>({
  name: 'Portfolio',
  target: Portfolio,
  tableName: 'portfolios',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar' },
    title: { type: 'varchar' },
    description: { type: 'text' },
    category: { type: 'varchar', nullable: true },
    images: { type: 'simple-array', nullable: true },
    projectUrl: { type: 'varchar', nullable: true },
    technologies: { type: 'simple-array', nullable: true },
    startDate: { type: 'timestamp', nullable: true },
    endDate: { type: 'timestamp', nullable: true },
    isPublished: { type: 'boolean', default: false },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
