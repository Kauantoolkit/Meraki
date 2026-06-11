export interface PaymentMethod {
  type: 'pix' | 'card' | 'bank_transfer';
  identifier: string; // Pix key, QR code, etc.
  amount: number;
  expiresAt: Date;
}

export interface PaymentProvider {
  generatePaymentMethod(amount: number, metadata: any): Promise<PaymentMethod>;
  verifyPayment(paymentId: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED' }>;
  transferFunds(amount: number, targetAccountId: string): Promise<{ transactionId: string }>;
}
