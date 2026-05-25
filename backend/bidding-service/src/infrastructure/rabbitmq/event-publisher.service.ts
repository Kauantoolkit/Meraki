import { Injectable } from '@nestjs/common';
import { RabbitMQConfigService } from './rabbitmq-config.service';
import { BidSubmittedEvent } from '../../domain/events/bid-submitted.event';
import { BidAcceptedEvent } from '../../domain/events/bid-accepted.event';
import { BidRejectedEvent } from '../../domain/events/bid-rejected.event';
import { BidWithdrawnEvent } from '../../domain/events/bid-withdrawn.event';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQConfigService) {}

  publishBidSubmitted(event: BidSubmittedEvent) {
    return this.rabbit.publishEvent('bid.submitted', event.payload);
  }

  publishBidAccepted(event: BidAcceptedEvent) {
    return this.rabbit.publishEvent('bid.accepted', event.payload);
  }

  publishBidRejected(event: BidRejectedEvent) {
    return this.rabbit.publishEvent('bid.rejected', event.payload);
  }

  publishBidWithdrawn(event: BidWithdrawnEvent) {
    return this.rabbit.publishEvent('bid.withdrawn', event.payload);
  }
}
