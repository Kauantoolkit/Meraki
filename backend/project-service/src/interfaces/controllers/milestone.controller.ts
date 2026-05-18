import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser } from '@shared/infra/auth';
import { CreateMilestoneDto } from '../../application/dto/create-milestone.dto';
import { CreateMilestoneUseCase } from '../../application/use-cases/create-milestone.use-case';
import { GetMilestonesByProjectUseCase } from '../../application/use-cases/get-milestones-by-project.use-case';
import { UpdateMilestoneStatusUseCase } from '../../application/use-cases/update-milestone-status.use-case';

@ApiTags('Milestones')
@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MilestoneController {
  constructor(
    private readonly createMilestone: CreateMilestoneUseCase,
    private readonly getMilestones: GetMilestonesByProjectUseCase,
    private readonly updateStatus: UpdateMilestoneStatusUseCase,
  ) {}

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Criar milestone do projeto (empresa)' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 201, description: 'Milestone criado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Sem permissão ou projeto encerrado.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  create(
    @Param('id') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.createMilestone.execute(projectId, dto, companyId);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Listar milestones do projeto' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Lista de milestones ordenada sequencialmente.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findAll(@Param('id') projectId: string) {
    return this.getMilestones.execute(projectId);
  }

  @Put('milestones/:milestoneId/start')
  @ApiOperation({
    summary: 'Iniciar milestone (especialista)',
    description: 'Aplica RN04: só inicia se todos os milestones anteriores estiverem APPROVED.',
  })
  @ApiParam({ name: 'milestoneId', description: 'UUID do milestone' })
  @ApiResponse({ status: 200, description: 'Milestone iniciado.' })
  @ApiResponse({ status: 400, description: 'RN04 violada — milestone anterior não aprovado.' })
  @ApiResponse({ status: 404, description: 'Milestone não encontrado.' })
  start(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'start');
  }

  @Put('milestones/:milestoneId/submit')
  @ApiOperation({ summary: 'Submeter entrega do milestone (especialista)' })
  @ApiParam({ name: 'milestoneId', description: 'UUID do milestone' })
  @ApiResponse({ status: 200, description: 'Entrega submetida para revisão.' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida.' })
  @ApiResponse({ status: 404, description: 'Milestone não encontrado.' })
  submit(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'submit');
  }

  @Put('milestones/:milestoneId/approve')
  @ApiOperation({ summary: 'Aprovar milestone (empresa)' })
  @ApiParam({ name: 'milestoneId', description: 'UUID do milestone' })
  @ApiResponse({ status: 200, description: 'Milestone aprovado.' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida.' })
  @ApiResponse({ status: 404, description: 'Milestone não encontrado.' })
  approve(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'approve');
  }

  @Put('milestones/:milestoneId/reject')
  @ApiOperation({ summary: 'Rejeitar milestone (empresa)' })
  @ApiParam({ name: 'milestoneId', description: 'UUID do milestone' })
  @ApiResponse({ status: 200, description: 'Milestone rejeitado — volta para IN_PROGRESS.' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida.' })
  @ApiResponse({ status: 404, description: 'Milestone não encontrado.' })
  reject(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'reject');
  }
}
