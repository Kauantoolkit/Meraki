import { Controller, Post, Patch, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { RequestWithdrawalUseCase } from '../../application/use-cases/request-withdrawal.use-case';
import { ApproveWithdrawalUseCase } from '../../application/use-cases/approve-withdrawal.use-case';
import { ProcessWithdrawalUseCase } from '../../application/use-cases/process-withdrawal.use-case';
import { GetSpecialistBalanceUseCase } from '../../application/use-cases/get-specialist-balance.use-case';
import { CreateWithdrawalDto } from '../../application/dto/create-withdrawal.dto';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(
    private readonly requestWithdrawal: RequestWithdrawalUseCase,
    private readonly approveWithdrawal: ApproveWithdrawalUseCase,
    private readonly processWithdrawal: ProcessWithdrawalUseCase,
    private readonly getBalance: GetSpecialistBalanceUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar saque' })
  request(@Body() dto: CreateWithdrawalDto, @Req() req: Request & { user: any }) {
    const specialistId = req.user?.specialistId ?? req.user?.sub;
    return this.requestWithdrawal.execute(dto, specialistId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprovar saque (admin)' })
  approve(@Param('id') id: string) {
    return this.approveWithdrawal.execute(id);
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'Processar saque aprovado' })
  process(@Param('id') id: string) {
    return this.processWithdrawal.execute(id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Consultar saldo do especialista logado' })
  balance(@Req() req: Request & { user: any }) {
    const specialistId = req.user?.specialistId ?? req.user?.sub;
    return this.getBalance.execute(specialistId);
  }
}
