import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post('escrow')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar escrow para milestone (empresa)' })
  createEscrow(@Body() body: Record<string, any>, @Req() req: Request) {
    return this.paymentsService.createEscrow(body, this.token(req));
  }

  @Post('release')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Liberar pagamento de milestone (empresa) — retém 10% (RN06)' })
  releasePayment(@Body() body: Record<string, any>, @Req() req: Request) {
    return this.paymentsService.releasePayment(body.milestoneId, this.token(req));
  }

  @Get('my')
  @ApiOperation({ summary: 'Meus pagamentos (especialista logado)' })
  findMine(@Req() req: Request) {
    return this.paymentsService.findMine(this.token(req));
  }

  @Get('company')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Pagamentos dos projetos da empresa logada' })
  findByCompany(@Req() req: Request) {
    return this.paymentsService.findByCompany(this.token(req));
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Pagamentos do projeto' })
  findByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    return this.paymentsService.findByProject(projectId, this.token(req));
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'Pagamento de um milestone' })
  findByMilestone(@Param('milestoneId') milestoneId: string, @Req() req: Request) {
    return this.paymentsService.findByMilestone(milestoneId, this.token(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do pagamento' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.paymentsService.findOne(id, this.token(req));
  }
}

@ApiTags('Payment Hiring')
@Controller('payments/hiring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentHiringGatewayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post()
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar pagamento de contratação (Pix via Mercado Pago)' })
  create(@Body() body: Record<string, any>, @Req() req: Request) {
    return this.paymentsService.createHiringPayment(body, this.token(req));
  }

  @Patch(':id/confirm')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Confirmar pagamento de contratação' })
  confirm(@Param('id') id: string, @Req() req: Request) {
    return this.paymentsService.confirmHiringPayment(id, this.token(req));
  }
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksGatewayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercadopago')
  @ApiOperation({ summary: 'Webhook Mercado Pago (sem autenticação)' })
  handleMercadoPago(@Body() body: Record<string, any>) {
    return this.paymentsService.forwardWebhook('mercadopago', body);
  }
}

@ApiTags('Withdrawals')
@Controller('withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get('balance')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Consultar saldo disponível para saque' })
  getBalance(@Req() req: Request) {
    return this.paymentsService.getBalance(this.token(req));
  }

  @Post()
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Solicitar saque' })
  requestWithdrawal(@Body() body: Record<string, unknown>, @Req() req: Request) {
    return this.paymentsService.requestWithdrawal(body, this.token(req));
  }
}
