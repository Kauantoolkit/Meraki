import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowAccount } from '../../domain/entities/escrow-account.entity';
import { IEscrowAccountRepository } from '../../domain/repositories/i-escrow-account.repository';

@Injectable()
export class EscrowAccountRepository implements IEscrowAccountRepository {
  constructor(
    @InjectRepository(EscrowAccount)
    private readonly repo: Repository<EscrowAccount>,
  ) {}

  findByProject(projectId: string): Promise<EscrowAccount | null> {
    return this.repo.findOne({ where: { projectId } });
  }

  save(escrow: EscrowAccount): Promise<EscrowAccount> {
    return this.repo.save(escrow);
  }
}
