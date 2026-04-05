import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../domain/entities/conversation.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,
  ) {}

  /**
   * Find all conversations where the given userId is a participant.
   * TypeORM simple-array stores values as comma-separated strings, so
   * we load all rows and filter in application code (acceptable for TCC/MVP volume).
   */
  async findByParticipant(userId: string): Promise<Conversation[]> {
    const all = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return all.filter((c) => c.participantIds.includes(userId));
  }

  findById(id: string): Promise<Conversation | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Find a conversation that contains BOTH userIdA and userIdB as participants.
   * Used to avoid creating duplicate 1-on-1 conversations.
   */
  async findByParticipants(userIdA: string, userIdB: string): Promise<Conversation | null> {
    const all = await this.repo.find();
    return (
      all.find(
        (c) =>
          c.participantIds.includes(userIdA) &&
          c.participantIds.includes(userIdB) &&
          c.participantIds.length === 2,
      ) || null
    );
  }

  save(conversation: Conversation): Promise<Conversation> {
    return this.repo.save(conversation);
  }

  async create(participantIds: string[]): Promise<Conversation> {
    const conversation = this.repo.create({ participantIds });
    return this.repo.save(conversation);
  }
}
