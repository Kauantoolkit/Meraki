import { Injectable } from '@nestjs/common';
import { CertificationRepository } from '../../infrastructure/repositories/certification.repository';
import { Certification } from '../../domain/entities/certification.entity';

@Injectable()
export class AddCertificationUseCase {
  constructor(private readonly certRepo: CertificationRepository) {}

  execute(data: Partial<Certification>): Promise<Certification> {
    return this.certRepo.save(data);
  }

  findBySpecialist(specialistId: string): Promise<Certification[]> {
    return this.certRepo.findBySpecialist(specialistId);
  }

  remove(id: string): Promise<void> {
    return this.certRepo.delete(id);
  }
}
