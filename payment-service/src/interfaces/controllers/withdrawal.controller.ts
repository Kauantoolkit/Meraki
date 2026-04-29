import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateWithdrawalDto } from '../../application/dto/create-withdrawal.dto';
import { WithdrawalResponseDto } from '../../application/dto/withdrawal-response.dto';
import { RequestWithdrawalUseCase } from '../../application/use-cases/request-withdrawal.use-case';
import { ApproveWithdrawalUseCase } from '../../application/use-cases/approve-withdrawal.use-case';
import { ProcessWithdrawalUseCase } from '../../application/use-cases/process-withdrawal.use-case';
import { GetSpecialistBalanceUseCase } from '../../application/use-cases/get-specialist-balance.use-case';
import { IWithdrawalRepository } from '../../domain/repositories/withdrawal.repository.interface';

@ApiTags('Withdrawals')
@Controller('withdrawals')
export class WithdrawalController {
  constructor(
    private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
    private readonly approveWithdrawalUseCase: ApproveWithdrawalUseCase,
    private readonly processWithdrawalUseCase: ProcessWithdrawalUseCase,
    private readonly getSpecialistBalanceUseCase: GetSpecialistBalanceUseCase,
    @Inject('IWithdrawalRepository')
    private readonly withdrawalRepository: IWithdrawalRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request a withdrawal',
    description:
      'Specialist requests to withdraw their earned balance via PIX or bank transfer',
  })
  @ApiResponse({ status: 201, description: 'Withdrawal request created' })
  @ApiResponse({ status: 400, description: 'Invalid data or insufficient balance' })
  async requestWithdrawal(@Body() dto: CreateWithdrawalDto): Promise<WithdrawalResponseDto> {
    return this.requestWithdrawalUseCase.execute(dto);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a withdrawal request',
    description: 'Admin approves the withdrawal request',
  })
  @ApiResponse({ status: 200, description: 'Withdrawal approved' })
  @ApiResponse({ status: 404, description: 'Withdrawal not found' })
  async approveWithdrawal(@Param('id') withdrawalId: string): Promise<WithdrawalResponseDto> {
    return this.approveWithdrawalUseCase.execute(withdrawalId);
  }

  @Patch(':id/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process an approved withdrawal',
    description:
      'Process the payment to send money via PIX or bank transfer to the specialist',
  })
  @ApiResponse({ status: 200, description: 'Withdrawal processing started' })
  @ApiResponse({ status: 400, description: 'Cannot process withdrawal' })
  async processWithdrawal(@Param('id') withdrawalId: string): Promise<WithdrawalResponseDto> {
    return this.processWithdrawalUseCase.execute(withdrawalId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get withdrawal details',
  })
  async getWithdrawal(@Param('id') withdrawalId: string): Promise<any> {
    const withdrawal = await this.withdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }
    return withdrawal;
  }

  @Get('specialist/:specialistId/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all withdrawals for a specialist',
  })
  async getSpecialistWithdrawals(@Param('specialistId') specialistId: string): Promise<any[]> {
    return this.withdrawalRepository.findBySpecialistId(specialistId);
  }

  @Get('specialist/:specialistId/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get specialist balance',
    description:
      'Get the current balance of a specialist (total earned, available, and withdrawn)',
  })
  async getBalance(@Param('specialistId') specialistId: string): Promise<any> {
    return this.getSpecialistBalanceUseCase.execute(specialistId);
  }
}
