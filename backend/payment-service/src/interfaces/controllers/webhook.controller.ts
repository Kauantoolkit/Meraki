import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';

@ApiTags('Webhooks')
@Controller('api/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly confirmPayment: ConfirmPaymentUseCase) {}

  @Post('mercadopago')
  @ApiOperation({ summary: 'Webhook para notificações do Mercado Pago' })
  async handleMercadoPago(@Body() body: any) {
    this.logger.log(`Webhook MP recebido: ${JSON.stringify(body)}`);

    if (body.type === 'payment' && body.data?.id) {
      try {
        await this.confirmPayment.executeByExternalId(body.data.id.toString());
      } catch (error) {
        this.logger.error('Erro ao processar webhook MP', error);
      }
    }

    return { ok: true };
  }
}
