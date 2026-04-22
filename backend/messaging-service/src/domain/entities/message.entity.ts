import { DomainException } from '../exceptions/domain.exception';

export class Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;

  // ── Behavior Methods ──────────────────────────────────────────────

  static create(conversationId: string, senderId: string, senderName: string, text: string): Message {
    if (!conversationId) throw new DomainException('conversationId é obrigatório');
    if (!senderId) throw new DomainException('senderId é obrigatório');
    if (!text || text.trim().length === 0) {
      throw new DomainException('Texto da mensagem não pode ser vazio');
    }

    const msg = new Message();
    msg.conversationId = conversationId;
    msg.senderId = senderId;
    msg.senderName = senderName;
    msg.text = text.trim();
    msg.createdAt = new Date();
    return msg;
  }

  belongsToConversation(conversationId: string): boolean {
    return this.conversationId === conversationId;
  }
}
