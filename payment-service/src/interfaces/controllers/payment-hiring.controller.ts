import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePaymentHiringDto } from '../../application/dto/create-payment-hiring.dto';
import { PaymentResponseDto } from '../../application/dto/payment-response.dto';
import { CreatePaymentHiringUseCase } from '../../application/use-cases/create-payment-hiring.use-case';
import { ConfirmPaymentHiringUseCase } from '../../application/use-cases/confirm-payment-hiring.use-case';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';

@ApiTags('Payments - Hiring')
@Controller('payments/hiring')
export class PaymentHiringController {
  constructor(
    private readonly createPaymentHiringUseCase: CreatePaymentHiringUseCase,
    private readonly confirmPaymentHiringUseCase: ConfirmPaymentHiringUseCase,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new payment for hiring a specialist',
    description: 'Company initiates payment to hire a specialist for a project',
  })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createPayment(@Body() dto: CreatePaymentHiringDto): Promise<PaymentResponseDto> {
    return this.createPaymentHiringUseCase.execute(dto);
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a payment',
    description: 'Confirm that the payment was received (e.g., after PIX confirmation)',
  })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(@Param('id') paymentId: string): Promise<any> {
    return this.confirmPaymentHiringUseCase.execute(paymentId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get payment details',
  })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') paymentId: string): Promise<any> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    return payment;
  }

  @Get('company/:companyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all payments made by a company',
  })
  async getCompanyPayments(@Param('companyId') companyId: string): Promise<any[]> {
    return this.paymentRepository.findByCompanyId(companyId);
  }
}
