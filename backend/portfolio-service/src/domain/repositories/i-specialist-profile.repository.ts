import { SpecialistPublicProfile } from '../entities/specialist-public-profile.entity';

export interface ISpecialistProfileRepository {
  findByUserId(userId: string): Promise<SpecialistPublicProfile | null>;
  findAll(): Promise<SpecialistPublicProfile[]>;
  save(profile: SpecialistPublicProfile): Promise<SpecialistPublicProfile>;
  updateRating(userId: string, rating: number): Promise<void>;
}
