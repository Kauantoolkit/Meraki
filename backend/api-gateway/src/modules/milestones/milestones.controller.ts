import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Milestones / Deliveries')
@Controller('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post(':id/submit')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Submeter entrega de milestone (especialista)' })
  submitDelivery(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return this.milestonesService.submitDelivery(id, body, this.token(req));
  }

  @Put(':id/approve')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Aprovar entrega do milestone (empresa)' })
  approveDelivery(@Param('id') id: string, @Body() body: { amount?: number }, @Req() req: Request) {
    return this.milestonesService.approveDelivery(id, body?.amount, this.token(req));
  }

  @Put(':id/reject')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Rejeitar entrega do milestone (empresa)' })
  rejectDelivery(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: Request) {
    return this.milestonesService.rejectDelivery(id, body.reason, this.token(req));
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Adicionar comentário ao milestone' })
  addComment(@Param('id') id: string, @Body() body: { comment: string }, @Req() req: Request) {
    return this.milestonesService.addComment(id, body.comment, this.token(req));
  }
}

// Controller separado para o Kanban board (RF08)
import { Controller as ControllerDecorator } from '@nestjs/common';

@ApiTags('Kanban')
@ControllerDecorator('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class KanbanController {
  constructor(private readonly milestonesService: MilestonesService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get(':id/kanban')
  @ApiOperation({ summary: 'Kanban board do projeto (RF08)' })
  getKanbanBoard(@Param('id') id: string, @Req() req: Request) {
    return this.milestonesService.getKanbanBoard(id, this.token(req));
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico de atividades do projeto (RF11)' })
  getHistory(@Param('id') id: string, @Req() req: Request) {
    return this.milestonesService.getProjectHistory(id, this.token(req));
  }
}
