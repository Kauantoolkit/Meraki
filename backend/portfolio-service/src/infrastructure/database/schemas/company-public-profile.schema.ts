import { EntitySchema } from 'typeorm';
import { CompanyPublicProfile } from '../../../domain/entities/company-public-profile.entity';

export const CompanyPublicProfileSchema = new EntitySchema<CompanyPublicProfile>({
  name: 'CompanyPublicProfile',
  target: CompanyPublicProfile,
  tableName: 'company_profiles',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'varchar', unique: true },
    companyName: { type: 'varchar', nullable: true },
    description: { type: 'text', nullable: true },
    website: { type: 'varchar', nullable: true },
    sector: { type: 'varchar', nullable: true },
    totalProjectsCreated: { type: 'int', default: 0 },
    rating: { type: 'decimal', precision: 3, scale: 2, default: 0 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
