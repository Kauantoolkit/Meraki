import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Bid } from '../../domain/entities/bid.entity';
import { IBidRepository } from '../../domain/repositories/bid.repository.interface';
import { BidStatus } from '../../domain/enums/bid-status.enum';

@Injectable()
export class BidRepository implements IBidRepository {
  constructor(
    @InjectRepository(Bid)
    private readonly repo: Repository<Bid>,
  ) {}

  findById(id: string): Promise<Bid | null> {
    return this.repo.findOne({ where: { id }, relations: ['messages'] });
  }

  findByProject(projectId: string): Promise<Bid[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  findBySpecialist(specialistId: string): Promise<Bid[]> {
    return this.repo.find({ where: { specialistId }, order: { createdAt: 'DESC' } });
  }

  findByProjectAndSpecialist(projectId: string, specialistId: string): Promise<Bid[]> {
    return this.repo.find({ where: { projectId, specialistId } });
  }

  findAcceptedByProject(projectId: string): Promise<Bid | null> {
    return this.repo.findOne({ where: { projectId, status: BidStatus.ACCEPTED } });
  }

  save(bid: Bid): Promise<Bid> {
    return this.repo.save(bid);
  }

  /** Rejeita todas as propostas PENDING do projeto, exceto a aceita — RN03 */
  async rejectAllPendingExcept(projectId: string, acceptedBidId: string): Promise<void> {
    await this.repo.update(
      { projectId, status: BidStatus.PENDING, id: Not(acceptedBidId) },
      { status: BidStatus.REJECTED },
    );
  }
}
