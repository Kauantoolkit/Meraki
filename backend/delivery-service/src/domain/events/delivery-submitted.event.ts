import { BaseEvent } from './base.event';

export class DeliverySubmittedEvent extends BaseEvent {
  readonly payload: {
    deliveryId: string;
    milestoneId: string;
    projectId: string;
    specialistId: string;
  };

  constructor(payload: DeliverySubmittedEvent['payload']) {
    super();
    this.payload = payload;
  }
}
