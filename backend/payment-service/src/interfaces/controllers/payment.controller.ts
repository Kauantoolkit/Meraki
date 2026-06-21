import { Controller, Get, Post, Body, Param, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { GetPaymentsUseCase } from '../../application/use-cases/get-payments.use-case';
import { ReleasePaymentUseCase } from '../../application/use-cases/release-payment.use-case';

@ApiTags('Payments')
@Controller('api/payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly getPaymentsUseCase: GetPaymentsUseCase,
    private readonly releasePaymentUseCase: ReleasePaymentUseCase,
  ) {}

  @Post('release')
  @ApiOperation({ summary: 'Liberar pagamento de milestone (escrow → released)' })
  async release(@Body() body: { milestoneId: string }) {
    const payment = await this.getPaymentsUseCase.findByMilestone(body.milestoneId);
    if (!payment) throw new NotFoundException('Pagamento não encontrado para este milestone.');
    await this.releasePaymentUseCase.execute({
      milestoneId: body.milestoneId,
      projectId: payment.projectId,
      amount: payment.amount,
      specialistId: payment.specialistId,
    });
    return { message: 'Pagamento liberado com sucesso' };
  }

  @Get('my')
  @ApiOperation({ summary: 'Pagamentos do especialista logado' })
  findMine(@Req() req: Request & { user: any }) {
    const specialistId = req.user?.specialistId;
    if (!specialistId) return [];
    return this.getPaymentsUseCase.findBySpecialist(specialistId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Pagamentos do projeto' })
  findByProject(@Param('projectId') projectId: string) {
    return this.getPaymentsUseCase.findByProject(projectId);
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'Pagamento do milestone' })
  findByMilestone(@Param('milestoneId') milestoneId: string) {
    return this.getPaymentsUseCase.findByMilestone(milestoneId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do pagamento' })
  findOne(@Param('id') id: string) {
    return this.getPaymentsUseCase.findById(id);
  }
}
