export interface PaymentMethod {
  type: 'pix' | 'card' | 'bank_transfer';
  identifier: string; // Pix copia-e-cola or QR code base64
  amount: number;
  expiresAt: Date;
  qrCode?: string;       // base64 QR code image
  qrCodeText?: string;   // Pix copia-e-cola text
  externalId?: string;   // Mercado Pago payment ID
}

export abstract class PaymentProvider {
  abstract generatePaymentMethod(amount: number, metadata: any): Promise<PaymentMethod>;
  abstract verifyPayment(paymentId: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED' }>;
  abstract transferFunds(amount: number, targetAccountId: string): Promise<{ transactionId: string }>;
}
