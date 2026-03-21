import { Certification } from '../entities/certification.entity';

export interface ICertificationRepository {
  save(cert: Partial<Certification>): Promise<Certification>;
  findBySpecialist(specialistId: string): Promise<Certification[]>;
  delete(id: string): Promise<void>;
}
