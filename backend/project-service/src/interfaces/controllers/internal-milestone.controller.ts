import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { GetMilestonesByProjectUseCase } from '../../application/use-cases/get-milestones-by-project.use-case';
import { GetProjectByIdUseCase } from '../../application/use-cases/get-project-by-id.use-case';
import { ApiKeyGuard } from '../guards/api-key.guard';

/**
 * Rota interna para comunicação inter-serviço.
 * Protegida por API Key fixa (header X-API-Key).
 */
@ApiExcludeController()
@Controller('api/internal/projects')
@UseGuards(ApiKeyGuard)
export class InternalMilestoneController {
  constructor(
    private readonly getMilestones: GetMilestonesByProjectUseCase,
    private readonly getProject: GetProjectByIdUseCase,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getProject.execute(id);
  }

  @Get(':id/milestones')
  findAll(@Param('id') projectId: string) {
    return this.getMilestones.execute(projectId);
  }
}
