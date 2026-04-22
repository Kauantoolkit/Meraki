import { EntitySchema } from 'typeorm';
import { Review } from '../../../domain/entities/review.entity';

export const ReviewSchema = new EntitySchema<Review>({
  name: 'Review',
  target: Review,
  tableName: 'reviews',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    specialistId: { type: 'varchar' },
    projectId: { type: 'varchar' },
    reviewerId: { type: 'varchar' },
    rating: { type: 'int' },
    comment: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
});
