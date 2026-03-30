import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BidMessage } from '../../domain/entities/bid-message.entity';

@Injectable()
export class BidMessageRepository {
  constructor(
    @InjectRepository(BidMessage)
    private readonly repo: Repository<BidMessage>,
  ) {}

  save(message: Partial<BidMessage>): Promise<BidMessage> {
    return this.repo.save(this.repo.create(message));
  }

  findByBid(bidId: string): Promise<BidMessage[]> {
    return this.repo.find({ where: { bidId }, order: { createdAt: 'ASC' } });
  }
}
