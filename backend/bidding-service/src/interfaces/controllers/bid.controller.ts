import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiResponse,
  ApiParam, ApiQuery,
} from '@nestjs/swagger';
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
@Controller('api/bids')
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submeter proposta (especialista) — RN02: 1 proposta ativa por projeto' })
  @ApiResponse({ status: 201, description: 'Proposta submetida com sucesso' })
  @ApiResponse({ status: 409, description: 'Especialista já possui proposta ativa neste projeto (RN02)' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  submit(@Body() dto: SubmitBidDto, @CurrentUser('specialistId') specialistId: string) {
    return this.submitBid.execute(dto, specialistId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propostas por projeto ou por especialista autenticado' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filtrar por projeto' })
  @ApiResponse({ status: 200, description: 'Lista de propostas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll(
    @Query('projectId') projectId?: string,
    @CurrentUser('specialistId') specialistId?: string,
  ) {
    if (projectId) return this.getBids.findByProject(projectId);
    return this.getBids.findBySpecialist(specialistId);
  }

  @Get('my-bids')
  @ApiOperation({ summary: 'Minhas propostas (especialista autenticado)' })
  @ApiResponse({ status: 200, description: 'Propostas do especialista autenticado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  myBids(@CurrentUser('specialistId') specialistId: string) {
    return this.getBids.findBySpecialist(specialistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma proposta' })
  @ApiParam({ name: 'id', description: 'ID da proposta (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados da proposta' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findOne(@Param('id') id: string) {
    return this.getBids.findById(id);
  }

  @Put(':id/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Aceitar proposta — RN03: seleciona único vencedor e rejeita automaticamente as demais',
    description:
      'Ao aceitar uma proposta, ela passa para ACCEPTED e todas as demais PENDING do mesmo ' +
      'projeto são automaticamente REJECTED. Operação transacional e idempotente para race conditions. ' +
      'Especialista não pode aceitar a própria proposta.',
  })
  @ApiParam({ name: 'id', description: 'ID da proposta a ser aceita (UUID)' })
  @ApiResponse({ status: 204, description: 'Proposta aceita — especialista selecionado como vencedor' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 409, description: 'Projeto já possui um especialista selecionado (RN03)' })
  @ApiResponse({ status: 403, description: 'Especialista não pode aceitar a própria proposta' })
  @ApiResponse({ status: 400, description: 'Proposta não está em estado PENDING (ex.: já REJECTED ou WITHDRAWN)' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  accept(
    @Param('id') id: string,
    @CurrentUser('specialistId') callerSpecialistId: string,
  ) {
    return this.acceptBid.execute(id, callerSpecialistId);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rejeitar proposta manualmente (empresa)' })
  @ApiParam({ name: 'id', description: 'ID da proposta (UUID)' })
  @ApiResponse({ status: 204, description: 'Proposta rejeitada' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 400, description: 'Proposta não está em estado PENDING' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  reject(@Param('id') id: string) {
    return this.rejectBid.execute(id);
  }

  @Put(':id/withdraw')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirar proposta (especialista dono da proposta)' })
  @ApiParam({ name: 'id', description: 'ID da proposta (UUID)' })
  @ApiResponse({ status: 204, description: 'Proposta retirada' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 403, description: 'Apenas o especialista dono pode retirar a proposta' })
  @ApiResponse({ status: 400, description: 'Proposta não está em estado PENDING' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  withdraw(@Param('id') id: string, @CurrentUser('specialistId') specialistId: string) {
    return this.withdrawBid.execute(id, specialistId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensagem de negociação na proposta' })
  @ApiParam({ name: 'id', description: 'ID da proposta (UUID)' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 403, description: 'Não é possível enviar mensagens em propostas encerradas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendBidMessageDto,
    @CurrentUser('sub') senderId: string,
  ) {
    return this.sendMessageUseCase.execute(id, dto, senderId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens de negociação da proposta' })
  @ApiParam({ name: 'id', description: 'ID da proposta (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getMessages(@Param('id') id: string) {
    return this.getMessagesUseCase.execute(id);
  }
}
