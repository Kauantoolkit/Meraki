import { EntitySchema } from 'typeorm';
import { CompanyProfile } from '../../../domain/entities/company-profile.entity';

export const CompanyProfileSchema = new EntitySchema<CompanyProfile>({
  name: 'CompanyProfile',
  target: CompanyProfile,
  tableName: 'company_profiles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      type: 'varchar',
    },
    companyName: {
      type: 'varchar',
    },
    industry: {
      type: 'varchar',
      nullable: true,
    },
    companySize: {
      type: 'varchar',
      nullable: true,
    },
    website: {
      type: 'varchar',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
