import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly timestamp: Date;
  public readonly payload: Record<string, any>;

  constructor(eventType: string, payload: Record<string, any>) {
    this.eventId = uuidv4();
    this.eventType = eventType;
    this.timestamp = new Date();
    this.payload = payload;
  }
}
