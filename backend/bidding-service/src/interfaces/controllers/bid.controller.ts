import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SubmitBidDto } from '../../application/dto/submit-bid.dto';
import { SendBidMessageDto } from '../../application/dto/send-bid-message.dto';
import { SubmitBidUseCase } from '../../application/use-cases/submit-bid.use-case';
import { AcceptBidUseCase } from '../../application/use-cases/accept-bid.use-case';
import { RejectBidUseCase } from '../../application/use-cases/reject-bid.use-case';
import { WithdrawBidUseCase } from '../../application/use-cases/withdraw-bid.use-case';
import { GetBidsUseCase } from '../../application/use-cases/get-bids.use-case';
import { SendBidMessageUseCase } from '../../application/use-cases/send-bid-message.use-case';
import { GetBidMessagesUseCase } from '../../application/use-cases/get-bid-messages.use-case';

@ApiTags('Bids')
@Controller('api/v1/bids')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BidController {
  constructor(
    private readonly submitBid: SubmitBidUseCase,
    private readonly acceptBid: AcceptBidUseCase,
    private readonly rejectBid: RejectBidUseCase,
    private readonly withdrawBid: WithdrawBidUseCase,
    private readonly getBids: GetBidsUseCase,
    private readonly sendMessageUseCase: SendBidMessageUseCase,
    private readonly getMessagesUseCase: GetBidMessagesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submeter proposta — valida RN02 (1 proposta ativa/projeto)' })
  submit(@Body() dto: SubmitBidDto, @CurrentUser('specialistId') specialistId: string) {
    return this.submitBid.execute(dto, specialistId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propostas (por projectId ou por especialista autenticado)' })
  findAll(
    @Query('projectId') projectId?: string,
    @CurrentUser('specialistId') specialistId?: string,
  ) {
    if (projectId) return this.getBids.findByProject(projectId);
    return this.getBids.findBySpecialist(specialistId);
  }

  @Get('my-bids')
  @ApiOperation({ summary: 'Minhas propostas (especialista autenticado)' })
  myBids(@CurrentUser('specialistId') specialistId: string) {
    return this.getBids.findBySpecialist(specialistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da proposta' })
  findOne(@Param('id') id: string) {
    return this.getBids.findById(id);
  }

  @Put(':id/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Aceitar proposta — valida RN03 (1 vencedor/projeto) + rejeita as demais' })
  accept(@Param('id') id: string) {
    return this.acceptBid.execute(id);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rejeitar proposta (empresa)' })
  reject(@Param('id') id: string) {
    return this.rejectBid.execute(id);
  }

  @Put(':id/withdraw')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirar proposta (especialista dono)' })
  withdraw(@Param('id') id: string, @CurrentUser('specialistId') specialistId: string) {
    return this.withdrawBid.execute(id, specialistId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensagem de negociação na proposta' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendBidMessageDto,
    @CurrentUser('sub') senderId: string,
  ) {
    return this.sendMessageUseCase.execute(id, dto, senderId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens de negociação da proposta' })
  getMessages(@Param('id') id: string) {
    return this.getMessagesUseCase.execute(id);
  }
}
