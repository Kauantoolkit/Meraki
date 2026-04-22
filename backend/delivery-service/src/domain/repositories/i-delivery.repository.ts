import { Delivery, DeliveryStatus } from '../entities/delivery.entity';

export interface IDeliveryRepository {
  findByMilestoneAndStatus(milestoneId: string, status: DeliveryStatus): Promise<Delivery | null>;
  findByMilestone(milestoneId: string): Promise<Delivery | null>;
  save(delivery: Delivery): Promise<Delivery>;
}
