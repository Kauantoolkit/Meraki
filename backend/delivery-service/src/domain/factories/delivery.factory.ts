import { Injectable } from '@nestjs/common';
import { Delivery, DeliveryStatus } from '../entities/delivery.entity';
import { DomainException } from '../exceptions/domain.exception';

export interface CreateDeliveryData {
  milestoneId: string;
  projectId: string;
  specialistId: string;
  deliveryNotes?: string;
  deliveredFiles?: string[];
}

@Injectable()
export class DeliveryFactory {
  create(data: CreateDeliveryData): Delivery {
    if (!data.milestoneId) throw new DomainException('milestoneId é obrigatório');
    if (!data.projectId) throw new DomainException('projectId é obrigatório');
    if (!data.specialistId) throw new DomainException('specialistId é obrigatório');

    const delivery = new Delivery();
    delivery.milestoneId = data.milestoneId;
    delivery.projectId = data.projectId;
    delivery.specialistId = data.specialistId;
    delivery.deliveryNotes = data.deliveryNotes ?? null;
    delivery.deliveredFiles = data.deliveredFiles ?? [];
    delivery.status = DeliveryStatus.SUBMITTED;
    delivery.submittedAt = new Date();

    return delivery;
  }
}
