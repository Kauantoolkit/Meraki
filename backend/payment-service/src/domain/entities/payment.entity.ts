import { PaymentNotInEscrowError } from '../exceptions/payment-not-in-escrow.error';

export enum PaymentStatus {
  PENDING = 'PENDING',
  ESCROW_HELD = 'ESCROW_HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export class Payment {
  id: string;
  projectId: string;
  milestoneId: string;
  specialistId: string;
  amount: number;
  specialistAmount: number;
  platformFee: number;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentIdentifier?: string;
  escrowTransactionId: string;
  releaseTransactionId: string;
  releasedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // ─── Domain behavior — RN06 ───────────────────────────────────────────────

  release(feeRate: number): { specialistAmount: number; platformFee: number } {
    if (this.status !== PaymentStatus.ESCROW_HELD) {
      throw new PaymentNotInEscrowError();
    }
    const amt = Number(this.amount);
    const fee = Number((amt * feeRate).toFixed(2));
    const specialist = Number((amt - fee).toFixed(2));

    this.platformFee = fee;
    this.specialistAmount = specialist;
    this.status = PaymentStatus.RELEASED;
    this.releasedAt = new Date();

    return { specialistAmount: specialist, platformFee: fee };
  }
}
