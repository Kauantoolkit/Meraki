import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../domain/entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  findByConversation(conversationId: string): Promise<Message[]> {
    return this.repo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  save(message: Message): Promise<Message> {
    return this.repo.save(message);
  }
}
