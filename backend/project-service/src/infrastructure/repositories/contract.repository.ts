import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../../domain/entities/contract.entity';
import { IContractRepository } from '../../domain/repositories/contract.repository.interface';

@Injectable()
export class ContractRepository implements IContractRepository {
  constructor(
    @InjectRepository(Contract)
    private readonly repo: Repository<Contract>,
  ) {}

  save(contract: Contract): Promise<Contract> {
    return this.repo.save(contract);
  }

  findByProject(projectId: string): Promise<Contract[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  findByMilestone(milestoneId: string): Promise<Contract[]> {
    return this.repo.find({ where: { milestoneId }, order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Contract | null> {
    return this.repo.findOne({ where: { id } });
  }
}
