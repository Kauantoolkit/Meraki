import { Injectable, NotFoundException } from '@nestjs/common';
import { BidRepository } from '../../infrastructure/repositories/bid.repository';

@Injectable()
export class GetBidsUseCase {
  constructor(private readonly bidRepo: BidRepository) {}

  findByProject(projectId: string) {
    return this.bidRepo.findByProject(projectId);
  }

  findBySpecialist(specialistId: string) {
    return this.bidRepo.findBySpecialist(specialistId);
  }

  async findById(id: string) {
    const bid = await this.bidRepo.findById(id);
    if (!bid) throw new NotFoundException('Proposta não encontrada');
    return bid;
  }
}
