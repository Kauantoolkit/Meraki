import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Domain
import { Conversation } from './domain/entities/conversation.entity';
import { Message } from './domain/entities/message.entity';

// Infrastructure
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { MessageRepository } from './infrastructure/repositories/message.repository';

// Application — use cases
import { GetConversationsUseCase } from './application/use-cases/get-conversations.use-case';
import { GetOrCreateConversationUseCase } from './application/use-cases/get-or-create-conversation.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SaveMessageUseCase } from './application/use-cases/save-message.use-case';

// Interfaces
import { MessagingController } from './interfaces/controllers/messaging.controller';
import { ChatGateway } from './interfaces/gateways/chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // No signOptions needed — this service only verifies tokens
    }),
  ],
  controllers: [MessagingController],
  providers: [
    // Auth
    JwtStrategy,
    // Repositories
    ConversationRepository,
    MessageRepository,
    // Use cases
    GetConversationsUseCase,
    GetOrCreateConversationUseCase,
    GetMessagesUseCase,
    SaveMessageUseCase,
    // WebSocket gateway
    ChatGateway,
  ],
})
export class MessagingModule {}
