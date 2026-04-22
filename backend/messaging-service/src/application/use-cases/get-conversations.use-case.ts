import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { Conversation } from '../../domain/entities/conversation.entity';

@Injectable()
export class GetConversationsUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  execute(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.findByParticipant(userId);
  }
}
