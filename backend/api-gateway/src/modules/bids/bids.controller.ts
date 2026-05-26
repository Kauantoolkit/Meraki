import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';
import { SubmitBidDto } from './dto/submit-bid.dto';

@ApiTags('Bids')
@Controller('bids')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post('project/:projectId')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Submeter proposta (especialista)' })
  submit(@Param('projectId') projectId: string, @Body() body: SubmitBidDto, @Req() req: Request) {
    return this.bidsService.submit(projectId, body, this.token(req));
  }

  @Get('project/:projectId')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Listar propostas de um projeto (empresa dona)' })
  findByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    return this.bidsService.findByProject(projectId, this.token(req), (req.user as any).companyId);
  }

  @Get('my-bids')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Minhas propostas (especialista)' })
  findMyBids(@Req() req: Request) {
    return this.bidsService.findMyBids(this.token(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da proposta' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.bidsService.findOne(id, this.token(req));
  }

  @Put(':id/accept')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Aceitar proposta (empresa)' })
  accept(@Param('id') id: string, @Req() req: Request) {
    return this.bidsService.accept(id, this.token(req), (req.user as any).companyId);
  }

  @Put(':id/reject')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Rejeitar proposta (empresa)' })
  reject(@Param('id') id: string, @Req() req: Request) {
    return this.bidsService.reject(id, this.token(req), (req.user as any).companyId);
  }

  @Put(':id/withdraw')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Retirar proposta (especialista)' })
  withdraw(@Param('id') id: string, @Req() req: Request) {
    return this.bidsService.withdraw(id, this.token(req));
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar mensagem de negociação na proposta' })
  sendMessage(@Param('id') id: string, @Body() body: { message: string }, @Req() req: Request) {
    return this.bidsService.sendMessage(id, body.message, this.token(req));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens de negociação da proposta' })
  getMessages(@Param('id') id: string, @Req() req: Request) {
    return this.bidsService.getMessages(id, this.token(req));
  }
}
