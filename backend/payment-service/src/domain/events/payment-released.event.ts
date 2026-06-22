import { BaseEvent } from './base.event';

export class PaymentReleasedEvent extends BaseEvent {
  readonly payload: {
    paymentId: string;
    milestoneId: string;
    projectId: string;
    amount: number;
    specialistAmount: number;
    platformFee: number;
    specialistId: string;
    payoutStatus?: 'TRANSFERRED' | 'PENDING_MANUAL';
    payoutTransactionId?: string | null;
  };

  constructor(payload: PaymentReleasedEvent['payload']) {
    super();
    this.payload = payload;
  }
}
