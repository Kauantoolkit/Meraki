import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@shared/infra/auth';
import { Request } from 'express';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { ReleasePaymentDto } from './dto/release-payment.dto';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post('escrow')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar escrow para milestone (empresa)' })
  createEscrow(@Body() body: CreateEscrowDto, @Req() req: Request) {
    return this.paymentsService.createEscrow(body, this.token(req));
  }

  @Post('release')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Liberar pagamento de milestone (empresa) — retém 10% (RN06)' })
  releasePayment(@Body() body: ReleasePaymentDto, @Req() req: Request) {
    return this.paymentsService.releasePayment(body.milestoneId, this.token(req));
  }

  @Get('my')
  @ApiOperation({ summary: 'Meus pagamentos (especialista logado)' })
  findMine(@Req() req: Request) {
    return this.paymentsService.findMine(this.token(req));
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Pagamentos do projeto' })
  findByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    return this.paymentsService.findByProject(projectId, this.token(req));
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'Pagamento de um milestone' })
  findByMilestone(@Param('milestoneId') milestoneId: string, @Req() req: Request) {
    return this.paymentsService.findByMilestone(milestoneId, this.token(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do pagamento' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.paymentsService.findOne(id, this.token(req));
  }
}
