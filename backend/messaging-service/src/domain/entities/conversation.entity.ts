import { DomainException } from '../exceptions/domain.exception';

export class Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  hasParticipant(userId: string): boolean {
    return this.participantIds && this.participantIds.includes(userId);
  }

  updateLastMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new DomainException('Mensagem não pode ser vazia');
    }
    this.lastMessage = message.trim();
    this.lastMessageAt = new Date();
  }
}
