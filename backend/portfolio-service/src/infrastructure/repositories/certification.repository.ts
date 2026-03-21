import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from '../../domain/entities/certification.entity';
import { ICertificationRepository } from '../../domain/repositories/i-certification.repository';

@Injectable()
export class CertificationRepository implements ICertificationRepository {
  constructor(
    @InjectRepository(Certification)
    private readonly repo: Repository<Certification>,
  ) {}

  save(cert: Partial<Certification>): Promise<Certification> {
    return this.repo.save(this.repo.create(cert));
  }

  findBySpecialist(specialistId: string): Promise<Certification[]> {
    return this.repo.find({ where: { specialistId }, order: { issueDate: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
