import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { CreatePaymentHiringDto } from '../dto/create-payment-hiring.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { ISpecialistBalanceRepository } from '../../domain/repositories/specialist-balance.repository.interface';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentType } from '../../domain/enums/payment-type.enum';
import { Payment } from '../../domain/entities/payment.entity';

@Injectable()
export class CreatePaymentHiringUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('ISpecialistBalanceRepository')
    private readonly balanceRepository: ISpecialistBalanceRepository,
  ) {}

  async execute(dto: CreatePaymentHiringDto): Promise<PaymentResponseDto> {
    // Validar dados
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Criar registro de pagamento
    const payment = new Payment();
    payment.specialistId = dto.specialistId;
    payment.companyId = dto.companyId;
    payment.projectId = dto.projectId;
    payment.amount = dto.amount;
    payment.type = PaymentType.HIRING;
    payment.status = PaymentStatus.PENDING;
    payment.description = dto.description;

    const createdPayment = await this.paymentRepository.create(payment);

    // Gerar QR Code PIX (simulado)
    const pixQrCode = await this.generatePixQrCode(createdPayment.id, dto.amount);
    createdPayment.pixQrCode = pixQrCode;

    const updatedPayment = await this.paymentRepository.update(createdPayment.id, {
      pixQrCode,
    });

    if (!updatedPayment) {
      throw new BadRequestException('Failed to update payment');
    }

    return this.mapToDto(updatedPayment);
  }

  private async generatePixQrCode(paymentId: string, amount: number): Promise<string> {
    // Simulação de geração de QR Code PIX
    // Em produção, você integraria com o banco ou provedor PIX (como a API do Banco do Brasil)
    const timestamp = Date.now();
    return `00020126360014br.gov.bcb.pix0136${paymentId}-${timestamp}-${Math.floor(amount * 100)}`;
  }

  private mapToDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      specialistId: payment.specialistId,
      companyId: payment.companyId,
      projectId: payment.projectId,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      pixQrCode: payment.pixQrCode,
      transactionId: payment.transactionId,
      description: payment.description,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
    };
  }
}
