import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly timestamp: string;

  constructor(eventType: string) {
    this.eventId = uuidv4();
    this.eventType = eventType;
    this.timestamp = new Date().toISOString();
  }
}
