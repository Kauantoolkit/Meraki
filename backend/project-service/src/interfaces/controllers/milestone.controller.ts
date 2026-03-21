import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateMilestoneDto } from '../../application/dto/create-milestone.dto';
import { CreateMilestoneUseCase } from '../../application/use-cases/create-milestone.use-case';
import { GetMilestonesByProjectUseCase } from '../../application/use-cases/get-milestones-by-project.use-case';
import { UpdateMilestoneStatusUseCase } from '../../application/use-cases/update-milestone-status.use-case';

@ApiTags('Milestones')
@Controller('api/projects')
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
  create(
    @Param('id') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @CurrentUser('id') companyId: string,
  ) {
    return this.createMilestone.execute(projectId, dto, companyId);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Listar milestones do projeto' })
  findAll(@Param('id') projectId: string) {
    return this.getMilestones.execute(projectId);
  }

  @Put('milestones/:milestoneId/start')
  @ApiOperation({ summary: 'Iniciar milestone — valida RN04 (sequencial)' })
  start(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'start');
  }

  @Put('milestones/:milestoneId/submit')
  @ApiOperation({ summary: 'Submeter entrega do milestone (especialista)' })
  submit(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'submit');
  }

  @Put('milestones/:milestoneId/approve')
  @ApiOperation({ summary: 'Aprovar milestone (empresa)' })
  approve(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'approve');
  }

  @Put('milestones/:milestoneId/reject')
  @ApiOperation({ summary: 'Rejeitar milestone (empresa)' })
  reject(@Param('milestoneId') milestoneId: string) {
    return this.updateStatus.execute(milestoneId, 'reject');
  }
}
