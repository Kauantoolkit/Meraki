import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { Conversation } from '../../domain/entities/conversation.entity';

@Injectable()
export class GetOrCreateConversationUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  /**
   * Finds an existing 1-on-1 conversation between two participants,
   * or creates a new one if none exists.
   */
  async execute(participantIds: string[]): Promise<Conversation> {
    if (participantIds.length === 2) {
      const existing = await this.conversationRepo.findByParticipants(
        participantIds[0],
        participantIds[1],
      );
      if (existing) return existing;
    }

    return this.conversationRepo.create(participantIds);
  }
}
