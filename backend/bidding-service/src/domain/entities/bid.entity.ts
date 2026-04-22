import { BidStatus } from '../enums/bid-status.enum';
import { BidMessage } from './bid-message.entity';
import { BidNotPendingError } from '../exceptions/bid-not-pending.error';

export class Bid {
  id: string;

  /** FK para Project Context — referência externa */
  projectId: string;

  /** FK para Identity Context — referência externa */
  specialistId: string;

  proposal: string;
  proposedBudget: number;
  estimatedDuration: number; // dias
  status: BidStatus;
  messages: BidMessage[];
  createdAt: Date;
  updatedAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  accept(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('aceitar');
    }
    this.status = BidStatus.ACCEPTED;
  }

  reject(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('rejeitar');
    }
    this.status = BidStatus.REJECTED;
  }

  withdraw(): void {
    if (this.status !== BidStatus.PENDING) {
      throw new BidNotPendingError('retirar');
    }
    this.status = BidStatus.WITHDRAWN;
  }

  addMessage(senderId: string, content: string): BidMessage {
    const message = BidMessage.create(this.id, senderId, content);
    if (!this.messages) this.messages = [];
    this.messages.push(message);
    return message;
  }

  getUnreadMessages(userId: string): BidMessage[] {
    if (!this.messages) return [];
    return this.messages.filter(m => !m.isRead && !m.belongsToSender(userId));
  }
}
