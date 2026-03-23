import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from '../../application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { CancelProjectUseCase } from '../../application/use-cases/cancel-project.use-case';
import { ProjectStatus } from '../../domain/enums/project-status.enum';

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
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar projeto (empresa)' })
  create(@Body() dto: CreateProjectDto, @CurrentUser('companyId') companyId: string) {
    return this.createProject.execute(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos' })
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser('userType') userType?: string,
    @CurrentUser('companyId') companyId?: string,
    @CurrentUser('specialistId') specialistId?: string,
  ) {
    const filter: any = { status, page, limit };
    if (userType === 'COMPANY') filter.companyId = companyId;
    if (userType === 'SPECIALIST') filter.specialistId = specialistId;
    return this.getProjects.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do projeto' })
  findOne(@Param('id') id: string) {
    return this.getProjectById.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar projeto (empresa dona)' })
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
  cancel(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.cancelProject.execute(id, companyId);
  }
}
