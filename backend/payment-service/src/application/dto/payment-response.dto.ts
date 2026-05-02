import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../domain/entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() specialistId: string;
  @ApiProperty() projectId: string;
  @ApiProperty() milestoneId: string;
  @ApiProperty() amount: number;
  @ApiProperty() specialistAmount?: number;
  @ApiProperty() platformFee?: number;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty() escrowTransactionId?: string;
  @ApiProperty() releaseTransactionId?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() releasedAt?: Date;
}
