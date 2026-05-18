import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infra/auth';
import { GetProjectHistoryUseCase } from '../../application/use-cases/get-project-history.use-case';

@ApiTags('Project History')
@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectHistoryController {
  constructor(private readonly getHistory: GetProjectHistoryUseCase) {}

  @Get(':id/history')
  @ApiOperation({
    summary: 'Histórico de entregas do projeto (RN07)',
    description:
      'Retorna todos os eventos registrados automaticamente pelo sistema: criação do projeto, milestones criados e atualizações de status.',
  })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Lista de eventos ordenados cronologicamente.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findHistory(@Param('id') projectId: string) {
    return this.getHistory.execute(projectId);
  }
}
