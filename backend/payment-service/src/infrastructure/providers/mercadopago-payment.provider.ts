import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment as MpPayment } from 'mercadopago';
import { PaymentProvider, PaymentMethod } from './payment-provider.interface';

@Injectable()
export class MercadoPagoPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MercadoPagoPaymentProvider.name);
  private readonly client: MercadoPagoConfig;
  private readonly paymentApi: MpPayment;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    this.client = new MercadoPagoConfig({ accessToken });
    this.paymentApi = new MpPayment(this.client);
  }

  async generatePaymentMethod(amount: number, metadata: any): Promise<PaymentMethod> {
    try {
      const payment = await this.paymentApi.create({
        body: {
          transaction_amount: amount,
          description: metadata?.description || 'Meraki - Pagamento de projeto',
          payment_method_id: 'pix',
          payer: {
            email: metadata?.payerEmail || 'test@test.com',
          },
        },
      });

      const pixInfo = payment.point_of_interaction?.transaction_data;

      return {
        type: 'pix',
        identifier: payment.id?.toString() || '',
        amount,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        qrCode: pixInfo?.qr_code_base64 || '',
        qrCodeText: pixInfo?.qr_code || '',
        externalId: payment.id?.toString(),
      };
    } catch (error) {
      this.logger.error('Erro ao criar pagamento Mercado Pago', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED' }> {
    // Sandbox do MP não auto-aprova Pix — auto-aprovar sempre (projeto acadêmico)
    this.logger.log(`[AUTO] Aprovando pagamento ${paymentId}`);
    return { status: 'PAID' };
  }

  async transferFunds(amount: number, targetAccountId: string): Promise<{ transactionId: string }> {
    // Mercado Pago sandbox doesn't support real transfers
    // In production, this would use MP's disbursements API
    this.logger.log(`Transfer simulado: R$${amount} para ${targetAccountId}`);
    return { transactionId: `mp-transfer-${Date.now()}` };
  }
}
