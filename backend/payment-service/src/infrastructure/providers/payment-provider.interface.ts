export interface PaymentMethod {
  type: 'pix' | 'card' | 'bank_transfer';
  identifier: string; // Pix key, QR code, etc.
  amount: number;
  expiresAt: Date;
}

export abstract class PaymentProvider {
  abstract generatePaymentMethod(amount: number, metadata: any): Promise<PaymentMethod>;
  abstract verifyPayment(paymentId: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED' }>;
  abstract transferFunds(amount: number, targetAccountId: string): Promise<{ transactionId: string }>;
}
