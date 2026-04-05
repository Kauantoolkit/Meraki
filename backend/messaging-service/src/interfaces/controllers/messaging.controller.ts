import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateConversationDto } from '../../application/dto/create-conversation.dto';
import { GetConversationsUseCase } from '../../application/use-cases/get-conversations.use-case';
import { GetOrCreateConversationUseCase } from '../../application/use-cases/get-or-create-conversation.use-case';
import { GetMessagesUseCase } from '../../application/use-cases/get-messages.use-case';

@ApiTags('Messaging')
@Controller('api/conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly getConversations: GetConversationsUseCase,
    private readonly getOrCreateConversation: GetOrCreateConversationUseCase,
    private readonly getMessages: GetMessagesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas conversas' })
  listConversations(@CurrentUser('id') userId: string) {
    return this.getConversations.execute(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Buscar ou criar conversa com outro usuário' })
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.getOrCreateConversation.execute([userId, dto.otherUserId]);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Histórico de mensagens de uma conversa' })
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.getMessages.execute(conversationId, userId);
  }
}
