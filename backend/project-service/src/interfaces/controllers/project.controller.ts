import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from '../../application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { CancelProjectUseCase } from '../../application/use-cases/cancel-project.use-case';
import { CompleteProjectUseCase } from '../../application/use-cases/complete-project.use-case';
import { ProjectStatus } from '../../domain/enums/project-status.enum';
import { FindProjectsFilter } from '../../domain/repositories/project.repository.interface';

@ApiTags('Projects')
@Controller('api/projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly getProjects: GetProjectsUseCase,
    private readonly getProjectById: GetProjectByIdUseCase,
    private readonly updateProject: UpdateProjectUseCase,
    private readonly cancelProject: CancelProjectUseCase,
    private readonly completeProject: CompleteProjectUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar projeto (empresa)' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Escopo inválido (RN01) ou dados incorretos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  create(@Body() dto: CreateProjectDto, @CurrentUser('companyId') companyId: string) {
    return this.createProject.execute(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos' })
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada de projetos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser('userType') userType?: string,
    @CurrentUser('companyId') companyId?: string,
    @CurrentUser('specialistId') specialistId?: string,
  ) {
    const filter: FindProjectsFilter = { status, page, limit };
    if (userType === 'COMPANY') filter.companyId = companyId;
    if (userType === 'SPECIALIST') filter.specialistId = specialistId;
    return this.getProjects.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do projeto' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Dados do projeto encontrado.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.getProjectById.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar projeto (empresa dona)' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este projeto.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.updateProject.execute(id, dto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar projeto (empresa dona)' })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 204, description: 'Projeto cancelado.' })
  @ApiResponse({ status: 400, description: 'Projeto já concluído não pode ser cancelado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  cancel(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.cancelProject.execute(id, companyId);
  }

  @Put(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Concluir projeto',
    description: 'Valida que todas as milestones estão com status APPROVED antes de concluir.',
  })
  @ApiParam({ name: 'id', description: 'UUID do projeto' })
  @ApiResponse({ status: 204, description: 'Projeto concluído.' })
  @ApiResponse({ status: 400, description: 'Milestones pendentes impedem a conclusão.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  complete(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.completeProject.execute(id, companyId);
  }
}
