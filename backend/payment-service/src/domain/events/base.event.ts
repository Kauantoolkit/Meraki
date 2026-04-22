export abstract class BaseEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }
}
