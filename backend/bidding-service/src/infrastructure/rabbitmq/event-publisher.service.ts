import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@shared/infra/messaging/rabbitmq.service';
import { BiddingRoutingKey } from '@shared/contracts/events/bidding.events';
import { BidSubmittedEvent } from '../../domain/events/bid-submitted.event';
import { BidAcceptedEvent } from '../../domain/events/bid-accepted.event';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbit: RabbitMQService) {}

  publishBidSubmitted(event: BidSubmittedEvent) {
    return this.rabbit.publishEvent(BiddingRoutingKey.BID_SUBMITTED, event.payload);
  }

  publishBidAccepted(event: BidAcceptedEvent) {
    return this.rabbit.publishEvent(BiddingRoutingKey.BID_ACCEPTED, event.payload);
  }
}
