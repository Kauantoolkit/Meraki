import { BaseEvent } from './base.event';

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
  userType: 'COMPANY' | 'SPECIALIST';
  companyId?: string;
  specialistId?: string;
  companyName?: string;
}

export class UserRegisteredEvent extends BaseEvent {
  constructor(payload: UserRegisteredPayload) {
    super('user.registered', payload);
  }
}
