import {
  Controller, Get, Post, Put, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SubmitDeliveryUseCase } from '../../application/use-cases/submit-delivery.use-case';
import { ReviewDeliveryUseCase } from '../../application/use-cases/review-delivery.use-case';
import { GetKanbanBoardUseCase } from '../../application/use-cases/get-kanban-board.use-case';
import { GetProjectHistoryUseCase } from '../../application/use-cases/get-project-history.use-case';
import { AddMilestoneCommentUseCase } from '../../application/use-cases/add-milestone-comment.use-case';
import { GetMilestoneCommentsUseCase } from '../../application/use-cases/get-milestone-comments.use-case';
import { SubmitDeliveryDto } from '../../application/dtos/submit-delivery.dto';

@ApiTags('Deliveries')
@Controller('api/deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(
    private readonly submitDelivery: SubmitDeliveryUseCase,
    private readonly reviewDelivery: ReviewDeliveryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submeter entrega de milestone (especialista)' })
  submit(@Body() body: SubmitDeliveryDto, @CurrentUser('specialistId') specialistId: string) {
    return this.submitDelivery.execute(body, specialistId);
  }

  @Put(':milestoneId/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Aprovar entrega — dispara milestone.validated → payment-service' })
  approve(@Param('milestoneId') milestoneId: string, @Body() body: { amount: number }) {
    return this.reviewDelivery.approve(milestoneId, body.amount);
  }

  @Put(':milestoneId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rejeitar entrega (empresa)' })
  reject(@Param('milestoneId') milestoneId: string, @Body() body: { reason: string }) {
    return this.reviewDelivery.reject(milestoneId, body.reason);
  }
}

@ApiTags('Kanban')
@Controller('api/kanban')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class KanbanController {
  constructor(
    private readonly getKanban: GetKanbanBoardUseCase,
    private readonly getHistory: GetProjectHistoryUseCase,
  ) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Kanban board do projeto (RF08)' })
  getBoard(@Param('projectId') projectId: string) {
    return this.getKanban.execute(projectId);
  }
}

@ApiTags('History')
@Controller('api/history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyUseCase: GetProjectHistoryUseCase) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Histórico de atividades do projeto (RF11)' })
  getHistory(@Param('projectId') projectId: string) {
    return this.historyUseCase.execute(projectId);
  }
}

@ApiTags('Milestones')
@Controller('api/deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(
    private readonly addComment: AddMilestoneCommentUseCase,
    private readonly getComments: GetMilestoneCommentsUseCase,
  ) {}

  @Post(':milestoneId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar comentário ao milestone' })
  add(
    @Param('milestoneId') milestoneId: string,
    @Body() body: { comment: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.addComment.execute(milestoneId, userId, body.comment);
  }

  @Get(':milestoneId/comments')
  @ApiOperation({ summary: 'Listar comentários do milestone' })
  list(@Param('milestoneId') milestoneId: string) {
    return this.getComments.execute(milestoneId);
  }
}
