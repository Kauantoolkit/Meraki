import { ApiProperty } from '@nestjs/swagger';
import { WithdrawalStatus } from '../../domain/enums/withdrawal-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class WithdrawalResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() specialistId: string;
  @ApiProperty() amount: number;
  @ApiProperty({ enum: PaymentMethod }) method: PaymentMethod;
  @ApiProperty() pixKey?: string;
  @ApiProperty() bankDetails?: string;
  @ApiProperty({ enum: WithdrawalStatus }) status: WithdrawalStatus;
  @ApiProperty() processedAt?: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
