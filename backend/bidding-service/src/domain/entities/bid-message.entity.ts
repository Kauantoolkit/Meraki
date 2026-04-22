import { DomainException } from '../exceptions/domain.exception';

/**
 * Entity — Mensagem vinculada a uma Bid.
 * Aggregate child de Bid — possui identidade própria e comportamento de domínio.
 */
export class BidMessage {
  id: string;
  bidId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;

  // ─── Domain behavior ───────────────────────────────────────────────────────

  static create(bidId: string, senderId: string, content: string): BidMessage {
    if (!bidId) throw new DomainException('bidId é obrigatório para criar mensagem');
    if (!senderId) throw new DomainException('senderId é obrigatório para criar mensagem');
    if (!content || content.trim().length === 0) {
      throw new DomainException('Conteúdo da mensagem não pode ser vazio');
    }
    if (content.trim().length > 2000) {
      throw new DomainException('Conteúdo da mensagem não pode exceder 2000 caracteres');
    }

    const message = new BidMessage();
    message.bidId = bidId;
    message.senderId = senderId;
    message.content = content.trim();
    message.isRead = false;
    message.createdAt = new Date();
    return message;
  }

  markAsRead(): void {
    if (this.isRead) {
      throw new DomainException('Mensagem já foi marcada como lida');
    }
    this.isRead = true;
  }

  belongsToSender(userId: string): boolean {
    return this.senderId === userId;
  }
}
