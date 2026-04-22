import { BaseEvent } from './base.event';

export class ReviewAddedEvent extends BaseEvent {
  readonly payload: { reviewId: string; specialistId: string; projectId: string; rating: number };

  constructor(payload: ReviewAddedEvent['payload']) {
    super('review.added');
    this.payload = payload;
  }
}
