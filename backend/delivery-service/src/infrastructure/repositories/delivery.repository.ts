import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../../domain/entities/delivery.entity';
import { IDeliveryRepository } from '../../domain/repositories/i-delivery.repository';

@Injectable()
export class DeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repo: Repository<Delivery>,
  ) {}

  findByMilestoneAndStatus(milestoneId: string, status: DeliveryStatus): Promise<Delivery | null> {
    return this.repo.findOne({ where: { milestoneId, status } });
  }

  findByMilestone(milestoneId: string): Promise<Delivery | null> {
    return this.repo.findOne({ where: { milestoneId } });
  }

  save(delivery: Delivery): Promise<Delivery> {
    return this.repo.save(delivery);
  }
}
