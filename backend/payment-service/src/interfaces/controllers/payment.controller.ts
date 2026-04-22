import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { GetPaymentsUseCase } from '../../application/use-cases/get-payments.use-case';

@ApiTags('Payments')
@Controller('api/payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly getPaymentsUseCase: GetPaymentsUseCase) {}

  @Get('my')
  @ApiOperation({ summary: 'Pagamentos do especialista logado' })
  findMine(@Req() req: Request & { user: any }) {
    const specialistId = req.user?.specialistId ?? req.user?.sub;
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
