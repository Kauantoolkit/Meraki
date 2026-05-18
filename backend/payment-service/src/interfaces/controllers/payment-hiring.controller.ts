import { Controller, Post, Body, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { CreatePaymentHiringUseCase } from '../../application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { CreatePaymentHiringDto } from '../../application/dto/create-payment-hiring.dto';

@ApiTags('Payment Hiring')
@Controller('payments/hiring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentHiringController {
  constructor(
    private readonly createPaymentHiring: CreatePaymentHiringUseCase,
    private readonly confirmPayment: ConfirmPaymentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar pagamento de contratação' })
  create(@Body() dto: CreatePaymentHiringDto, @Req() req: Request & { user: any }) {
    const companyId = req.user?.companyId ?? req.user?.sub;
    return this.createPaymentHiring.execute(dto, companyId);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar pagamento (libera para especialista)' })
  confirm(@Param('id') id: string) {
    return this.confirmPayment.execute(id);
  }
}
