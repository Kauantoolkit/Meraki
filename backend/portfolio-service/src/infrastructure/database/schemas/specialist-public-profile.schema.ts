import { EntitySchema } from 'typeorm';
import { SpecialistPublicProfile } from '../../../domain/entities/specialist-public-profile.entity';

export const SpecialistPublicProfileSchema = new EntitySchema<SpecialistPublicProfile>({
  name: 'SpecialistPublicProfile',
  target: SpecialistPublicProfile,
  tableName: 'specialist_profiles',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    userId: { type: 'varchar', unique: true },
    name: { type: 'varchar', nullable: true },
    bio: { type: 'text', nullable: true },
    skills: { type: 'simple-array', nullable: true },
    experience: { type: 'int', nullable: true },
    hourlyRate: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    rating: { type: 'decimal', precision: 3, scale: 2, default: 0 },
    totalProjects: { type: 'int', default: 0 },
    completedProjects: { type: 'int', default: 0 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
});
