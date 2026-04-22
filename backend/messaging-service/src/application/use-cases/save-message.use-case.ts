import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { Message } from '../../domain/entities/message.entity';

export interface SaveMessageInput {
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
}

@Injectable()
export class SaveMessageUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async execute(input: SaveMessageInput): Promise<Message> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa ${input.conversationId} não encontrada`);
    }

    // Ensure sender is a participant
    if (!conversation.participantIds.includes(input.senderId)) {
      throw new NotFoundException(`Conversa ${input.conversationId} não encontrada`);
    }

    // Persist the message
    const message = new Message();
    message.conversationId = input.conversationId;
    message.senderId = input.senderId;
    message.senderName = input.senderName;
    message.text = input.text;

    const saved = await this.messageRepo.save(message);

    // Update conversation snapshot
    conversation.lastMessage = input.text;
    conversation.lastMessageAt = saved.createdAt;
    await this.conversationRepo.save(conversation);

    return saved;
  }
}
