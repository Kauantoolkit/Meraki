import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { GetContractsByProjectUseCase } from '../../application/use-cases/get-contracts-by-project.use-case';
import { GetContractsByMilestoneUseCase } from '../../application/use-cases/get-contracts-by-milestone.use-case';

@ApiTags('Contracts')
@Controller('api/contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(
    private readonly getContractsByProjectUseCase: GetContractsByProjectUseCase,
    private readonly getContractsByMilestoneUseCase: GetContractsByMilestoneUseCase,
  ) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Contratos do projeto' })
  findByProject(@Param('projectId') projectId: string) {
    return this.getContractsByProjectUseCase.execute(projectId);
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'Contratos de um milestone' })
  findByMilestone(@Param('milestoneId') milestoneId: string) {
    return this.getContractsByMilestoneUseCase.execute(milestoneId);
  }
}
