import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentMethod } from './payment-provider.interface';

@Injectable()
export class PixPaymentProvider implements PaymentProvider {
  constructor(private readonly configService: ConfigService) {}

  async generatePaymentMethod(amount: number, metadata: any): Promise<PaymentMethod> {
    const pixKey = this.configService.get<string>('PIX_KEY');

    return {
      type: 'pix',
      identifier: pixKey,
      amount,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h validity
    };
  }

  async verifyPayment(paymentId: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED' }> {
    // For testing purposes, we'll simulate a success.
    // In a real scenario, this would call an API or check a webhook.
    return { status: 'PAID' };
  }

  async transferFunds(amount: number, targetAccountId: string): Promise<{ transactionId: string }> {
    // Simulate a transfer to the specialist.
    return { transactionId: `pix-transfer-${Date.now()}` };
  }
}
