import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { Message } from '../../domain/entities/message.entity';

@Injectable()
export class GetMessagesUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(conversationId: string, userId: string): Promise<Message[]> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa ${conversationId} não encontrada`);
    }

    // Ensure requester is a participant
    if (!conversation.participantIds.includes(userId)) {
      throw new NotFoundException(`Conversa ${conversationId} não encontrada`);
    }

    return this.messageRepo.findByConversation(conversationId);
  }
}
