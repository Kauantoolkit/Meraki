import { EntitySchema } from 'typeorm';
import { SpecialistProfile } from '../../../domain/entities/specialist-profile.entity';

export const SpecialistProfileSchema = new EntitySchema<SpecialistProfile>({
  name: 'SpecialistProfile',
  target: SpecialistProfile,
  tableName: 'specialist_profiles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      type: 'varchar',
    },
    bio: {
      type: 'text',
      nullable: true,
    },
    skills: {
      type: 'simple-array',
      nullable: true,
      default: '',
    },
    experience: {
      type: 'decimal',
      precision: 5,
      scale: 1,
      default: 0,
    },
    hourlyRate: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    rating: {
      type: 'decimal',
      precision: 3,
      scale: 2,
      default: 0,
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
