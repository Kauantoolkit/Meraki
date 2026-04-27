#!/usr/bin/env bash
# =============================================================================
# Meraki — project-service: aplicar histórico (RN07) + Swagger (RNF07)
# =============================================================================
# Como usar:
#   1. Coloque este script na raiz do monorepo (onde fica a pasta "backend/")
#      OU ajuste a variável ROOT abaixo para apontar para o project-service.
#   2. chmod +x apply-meraki-changes.sh
#   3. ./apply-meraki-changes.sh
# =============================================================================

set -euo pipefail

# ── Configuração ──────────────────────────────────────────────────────────────
# Caminho para o project-service a partir de onde você rodar o script.
# Ajuste se necessário.
ROOT="backend/project-service"
SRC="$ROOT/src"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[meraki]${NC} $1"; }
ok()   { echo -e "${GREEN}[ok]${NC} $1"; }
fail() { echo -e "${RED}[erro]${NC} $1"; exit 1; }

# ── Verificações iniciais ─────────────────────────────────────────────────────
[ -d "$SRC" ] || fail "Diretório '$SRC' não encontrado. Rode o script da raiz do monorepo ou ajuste a variável ROOT."
[ -f "$ROOT/package.json" ] || fail "package.json não encontrado em $ROOT"

log "Iniciando aplicação das mudanças no project-service..."

# =============================================================================
# 1. Instalar dependência @nestjs/event-emitter
# =============================================================================
log "Instalando @nestjs/event-emitter..."
cd "$ROOT"
npm install @nestjs/event-emitter --save --legacy-peer-deps 2>/dev/null && ok "@nestjs/event-emitter instalado" || fail "Falha ao instalar @nestjs/event-emitter"
cd - > /dev/null

# =============================================================================
# 2. Criar diretórios necessários
# =============================================================================
log "Criando estrutura de diretórios..."
mkdir -p "$SRC/domain/enums"
mkdir -p "$SRC/domain/repositories"
mkdir -p "$SRC/infrastructure/database/schemas"
mkdir -p "$SRC/infrastructure/repositories"
mkdir -p "$SRC/application/listeners"
mkdir -p "$SRC/application/use-cases"
mkdir -p "$SRC/interfaces/controllers"
ok "Diretórios prontos"

# =============================================================================
# 3. Criar arquivos novos
# =============================================================================

# ── 3.1 Enum ─────────────────────────────────────────────────────────────────
log "Criando project-history-action.enum.ts..."
cat > "$SRC/domain/enums/project-history-action.enum.ts" << 'EOF'
export enum ProjectHistoryAction {
  PROJECT_CREATED = 'PROJECT_CREATED',
  MILESTONE_CREATED = 'MILESTONE_CREATED',
  MILESTONE_UPDATED = 'MILESTONE_UPDATED',
}
EOF
ok "domain/enums/project-history-action.enum.ts"

# ── 3.2 Entidade de domínio ───────────────────────────────────────────────────
log "Criando project-history.entity.ts..."
cat > "$SRC/domain/entities/project-history.entity.ts" << 'EOF'
import { ProjectHistoryAction } from '../enums/project-history-action.enum';

export class ProjectHistory {
  id: string;
  projectId: string;
  action: ProjectHistoryAction;
  description: string;
  createdAt: Date;
}
EOF
ok "domain/entities/project-history.entity.ts"

# ── 3.3 Interface de repositório ──────────────────────────────────────────────
log "Criando project-history.repository.interface.ts..."
cat > "$SRC/domain/repositories/project-history.repository.interface.ts" << 'EOF'
import { ProjectHistory } from '../entities/project-history.entity';

export const PROJECT_HISTORY_REPOSITORY = 'PROJECT_HISTORY_REPOSITORY';

export interface IProjectHistoryRepository {
  save(entry: Omit<ProjectHistory, 'id' | 'createdAt'>): Promise<ProjectHistory>;
  findByProject(projectId: string): Promise<ProjectHistory[]>;
}
EOF
ok "domain/repositories/project-history.repository.interface.ts"

# ── 3.4 Schema TypeORM ────────────────────────────────────────────────────────
log "Criando project-history.schema.ts..."
cat > "$SRC/infrastructure/database/schemas/project-history.schema.ts" << 'EOF'
import { EntitySchema } from 'typeorm';
import { ProjectHistory } from '../../../domain/entities/project-history.entity';
import { ProjectHistoryAction } from '../../../domain/enums/project-history-action.enum';

export const ProjectHistorySchema = new EntitySchema<ProjectHistory>({
  name: 'ProjectHistory',
  target: ProjectHistory,
  tableName: 'project_histories',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    projectId: { type: String },
    action: { type: 'enum', enum: ProjectHistoryAction },
    description: { type: 'text' },
    createdAt: { type: Date, createDate: true },
  },
});
EOF
ok "infrastructure/database/schemas/project-history.schema.ts"

# ── 3.5 Implementação do repositório ─────────────────────────────────────────
log "Criando project-history.repository.ts..."
cat > "$SRC/infrastructure/repositories/project-history.repository.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectHistory } from '../../domain/entities/project-history.entity';
import { IProjectHistoryRepository } from '../../domain/repositories/project-history.repository.interface';

@Injectable()
export class ProjectHistoryRepository implements IProjectHistoryRepository {
  constructor(
    @InjectRepository(ProjectHistory)
    private readonly repo: Repository<ProjectHistory>,
  ) {}

  save(entry: Omit<ProjectHistory, 'id' | 'createdAt'>): Promise<ProjectHistory> {
    return this.repo.save(entry);
  }

  findByProject(projectId: string): Promise<ProjectHistory[]> {
    return this.repo.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }
}
EOF
ok "infrastructure/repositories/project-history.repository.ts"

# ── 3.6 Event Listener (RN07) ─────────────────────────────────────────────────
log "Criando project-history.listener.ts..."
cat > "$SRC/application/listeners/project-history.listener.ts" << 'EOF'
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProjectHistoryRepository } from '../../infrastructure/repositories/project-history.repository';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';
import { ProjectHistoryAction } from '../../domain/enums/project-history-action.enum';

@Injectable()
export class ProjectHistoryListener {
  private readonly logger = new Logger(ProjectHistoryListener.name);

  constructor(private readonly historyRepo: ProjectHistoryRepository) {}

  @OnEvent('project.created')
  async handleProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.PROJECT_CREATED,
        description: `Projeto "${event.payload.title}" criado com orçamento de R$ ${event.payload.budget}.`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de PROJECT_CREATED', err);
    }
  }

  @OnEvent('milestone.created')
  async handleMilestoneCreated(event: MilestoneCreatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.MILESTONE_CREATED,
        description: `Milestone #${event.payload.order} criado (id: ${event.payload.milestoneId}) com valor de R$ ${event.payload.amount}.`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de MILESTONE_CREATED', err);
    }
  }

  @OnEvent('milestone.updated')
  async handleMilestoneUpdated(event: MilestoneUpdatedEvent): Promise<void> {
    try {
      await this.historyRepo.save({
        projectId: event.payload.projectId,
        action: ProjectHistoryAction.MILESTONE_UPDATED,
        description: `Milestone ${event.payload.milestoneId} atualizado para o status "${event.payload.status}".`,
      });
    } catch (err) {
      this.logger.error('Erro ao registrar histórico de MILESTONE_UPDATED', err);
    }
  }
}
EOF
ok "application/listeners/project-history.listener.ts"

# ── 3.7 Use Case: GetProjectHistory ───────────────────────────────────────────
log "Criando get-project-history.use-case.ts..."
cat > "$SRC/application/use-cases/get-project-history.use-case.ts" << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectHistoryRepository } from '../../infrastructure/repositories/project-history.repository';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { ProjectHistory } from '../../domain/entities/project-history.entity';

@Injectable()
export class GetProjectHistoryUseCase {
  constructor(
    private readonly historyRepo: ProjectHistoryRepository,
    private readonly projectRepo: ProjectRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectHistory[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return this.historyRepo.findByProject(projectId);
  }
}
EOF
ok "application/use-cases/get-project-history.use-case.ts"

# ── 3.8 Controller: ProjectHistory ────────────────────────────────────────────
log "Criando project-history.controller.ts..."
cat > "$SRC/interfaces/controllers/project-history.controller.ts" << 'EOF'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetProjectHistoryUseCase } from '../../application/use-cases/get-project-history.use-case';

@ApiTags('Project History')
@Controller('api/projects')
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
EOF
ok "interfaces/controllers/project-history.controller.ts"

# =============================================================================
# 4. Sobrescrever arquivos existentes
# =============================================================================

# ── 4.1 app.module.ts — adiciona EventEmitterModule ──────────────────────────
log "Atualizando app.module.ts..."
cat > "$SRC/app.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { ProjectModule } from './project.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    EventEmitterModule.forRoot(),
    RabbitMQModule,
    ProjectModule,
  ],
})
export class AppModule {}
EOF
ok "app.module.ts"

# ── 4.2 typeorm.config.ts — registra ProjectHistory ──────────────────────────
log "Atualizando typeorm.config.ts..."
cat > "$SRC/infrastructure/database/typeorm.config.ts" << 'EOF'
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Project } from '../../domain/entities/project.entity';
import { Milestone } from '../../domain/entities/milestone.entity';
import { ProjectHistory } from '../../domain/entities/project-history.entity';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'project_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [Project, Milestone, ProjectHistory],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
EOF
ok "infrastructure/database/typeorm.config.ts"

# ── 4.3 project.module.ts — registra todos os novos providers ────────────────
log "Atualizando project.module.ts..."
cat > "$SRC/project.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Domain
import { Project } from './domain/entities/project.entity';
import { Milestone } from './domain/entities/milestone.entity';
import { ProjectHistory } from './domain/entities/project-history.entity';
import { ProjectFactory } from './domain/factories/project.factory';
import { MilestoneFactory } from './domain/factories/milestone.factory';

// Infrastructure
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { ProjectRepository } from './infrastructure/repositories/project.repository';
import { MilestoneRepository } from './infrastructure/repositories/milestone.repository';
import { ProjectHistoryRepository } from './infrastructure/repositories/project-history.repository';

// Application — Use Cases
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from './application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { CancelProjectUseCase } from './application/use-cases/cancel-project.use-case';
import { CompleteProjectUseCase } from './application/use-cases/complete-project.use-case';
import { AssignSpecialistUseCase } from './application/use-cases/assign-specialist.use-case';
import { CreateMilestoneUseCase } from './application/use-cases/create-milestone.use-case';
import { GetMilestonesByProjectUseCase } from './application/use-cases/get-milestones-by-project.use-case';
import { UpdateMilestoneStatusUseCase } from './application/use-cases/update-milestone-status.use-case';
import { GetProjectHistoryUseCase } from './application/use-cases/get-project-history.use-case';

// Application — Listeners
import { ProjectHistoryListener } from './application/listeners/project-history.listener';

// Interfaces
import { ProjectController } from './interfaces/controllers/project.controller';
import { MilestoneController } from './interfaces/controllers/milestone.controller';
import { ProjectHistoryController } from './interfaces/controllers/project-history.controller';

// Event consumer (bid.accepted)
import { BidAcceptedConsumer } from './infrastructure/rabbitmq/bid-accepted.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Milestone, ProjectHistory]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [
    ProjectController,
    MilestoneController,
    ProjectHistoryController,
  ],
  providers: [
    // Auth
    JwtStrategy,
    // Domain Factories
    { provide: ProjectFactory, useFactory: () => new ProjectFactory() },
    { provide: MilestoneFactory, useFactory: () => new MilestoneFactory() },
    // Repositories
    ProjectRepository,
    MilestoneRepository,
    ProjectHistoryRepository,
    // Use cases
    CreateProjectUseCase,
    GetProjectsUseCase,
    GetProjectByIdUseCase,
    UpdateProjectUseCase,
    CancelProjectUseCase,
    CompleteProjectUseCase,
    AssignSpecialistUseCase,
    CreateMilestoneUseCase,
    GetMilestonesByProjectUseCase,
    UpdateMilestoneStatusUseCase,
    GetProjectHistoryUseCase,
    // Listeners (RN07)
    ProjectHistoryListener,
    // Event consumer
    BidAcceptedConsumer,
  ],
})
export class ProjectModule {}
EOF
ok "project.module.ts"

# ── 4.4 project.controller.ts — adiciona @ApiResponse completos ──────────────
log "Atualizando project.controller.ts..."
cat > "$SRC/interfaces/controllers/project.controller.ts" << 'EOF'
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
EOF
ok "interfaces/controllers/project.controller.ts"

# ── 4.5 milestone.controller.ts — adiciona @ApiParam e @ApiResponse ──────────
log "Atualizando milestone.controller.ts..."
cat > "$SRC/interfaces/controllers/milestone.controller.ts" << 'EOF'
import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
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
EOF
ok "interfaces/controllers/milestone.controller.ts"

# =============================================================================
# 5. Publicar eventos via EventEmitter nos use cases existentes
# =============================================================================
# O EventPublisherService já publica no RabbitMQ. Precisamos também emitir
# os eventos internos com o EventEmitter2 para o listener de histórico capturar.
# Fazemos isso adicionando EventEmitter2 nos dois use cases.

log "Injetando EventEmitter2 em create-project.use-case.ts..."
cat > "$SRC/application/use-cases/create-project.use-case.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectFactory } from '../../domain/factories/project.factory';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { ProjectCreatedEvent } from '../../domain/events/project-created.event';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly factory: ProjectFactory,
    private readonly projectRepo: ProjectRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
  ) {}

  async execute(dto: CreateProjectDto, companyId: string): Promise<Project> {
    const project = this.factory.create({ ...dto, companyId });
    const saved = await this.projectRepo.save(project);

    const event = new ProjectCreatedEvent({
      projectId: saved.id,
      title: saved.title,
      budget: saved.budget,
      companyId: saved.companyId,
    });

    await this.events.publishProjectCreated(event);
    this.emitter.emit('project.created', event);

    return saved;
  }
}
EOF
ok "application/use-cases/create-project.use-case.ts"

log "Injetando EventEmitter2 em create-milestone.use-case.ts..."
cat > "$SRC/application/use-cases/create-milestone.use-case.ts" << 'EOF'
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneFactory } from '../../domain/factories/milestone.factory';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneCreatedEvent } from '../../domain/events/milestone-created.event';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { ProjectStatus } from '../../domain/enums/project-status.enum';

@Injectable()
export class CreateMilestoneUseCase {
  constructor(
    private readonly factory: MilestoneFactory,
    private readonly milestoneRepo: MilestoneRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
  ) {}

  async execute(projectId: string, dto: CreateMilestoneDto, companyId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.companyId !== companyId) throw new ForbiddenException('Não autorizado');
    if (project.status === ProjectStatus.CANCELLED || project.status === ProjectStatus.COMPLETED) {
      throw new ForbiddenException('Não é possível adicionar milestones a este projeto');
    }

    const existing = await this.milestoneRepo.findByProject(projectId);
    const nextOrder = existing.length + 1;

    const milestone = this.factory.create(dto, projectId, nextOrder);
    const saved = await this.milestoneRepo.save(milestone);

    const event = new MilestoneCreatedEvent({
      milestoneId: saved.id,
      projectId: saved.projectId,
      amount: saved.amount,
      order: saved.order,
    });

    await this.events.publishMilestoneCreated(event);
    this.emitter.emit('milestone.created', event);

    return saved;
  }
}
EOF
ok "application/use-cases/create-milestone.use-case.ts"

log "Injetando EventEmitter2 em update-milestone-status.use-case.ts..."
cat > "$SRC/application/use-cases/update-milestone-status.use-case.ts" << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MilestoneRepository } from '../../infrastructure/repositories/milestone.repository';
import { EventPublisherService } from '../../infrastructure/rabbitmq/event-publisher.service';
import { MilestoneUpdatedEvent } from '../../domain/events/milestone-updated.event';

export type MilestoneAction = 'start' | 'submit' | 'approve' | 'reject';

@Injectable()
export class UpdateMilestoneStatusUseCase {
  constructor(
    private readonly milestoneRepo: MilestoneRepository,
    private readonly events: EventPublisherService,
    private readonly emitter: EventEmitter2,
  ) {}

  async execute(milestoneId: string, action: MilestoneAction) {
    const milestone = await this.milestoneRepo.findById(milestoneId);
    if (!milestone) throw new NotFoundException('Milestone não encontrado');

    if (action === 'start') {
      const allMilestones = await this.milestoneRepo.findByProject(milestone.projectId);
      milestone.start(allMilestones);
    } else if (action === 'submit') {
      milestone.submit();
    } else if (action === 'approve') {
      milestone.approve();
    } else if (action === 'reject') {
      milestone.reject();
    }

    const saved = await this.milestoneRepo.save(milestone);

    const event = new MilestoneUpdatedEvent({
      milestoneId: saved.id,
      projectId: saved.projectId,
      status: saved.status,
    });

    await this.events.publishMilestoneUpdated(event);
    this.emitter.emit('milestone.updated', event);

    return saved;
  }
}
EOF
ok "application/use-cases/update-milestone-status.use-case.ts"

# =============================================================================
# 6. Resumo final
# =============================================================================
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  Todas as alterações foram aplicadas com sucesso!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "Arquivos CRIADOS:"
echo "  $SRC/domain/enums/project-history-action.enum.ts"
echo "  $SRC/domain/entities/project-history.entity.ts"
echo "  $SRC/domain/repositories/project-history.repository.interface.ts"
echo "  $SRC/infrastructure/database/schemas/project-history.schema.ts"
echo "  $SRC/infrastructure/repositories/project-history.repository.ts"
echo "  $SRC/application/listeners/project-history.listener.ts"
echo "  $SRC/application/use-cases/get-project-history.use-case.ts"
echo "  $SRC/interfaces/controllers/project-history.controller.ts"
echo ""
echo "Arquivos ATUALIZADOS:"
echo "  $SRC/app.module.ts"
echo "  $SRC/infrastructure/database/typeorm.config.ts"
echo "  $SRC/project.module.ts"
echo "  $SRC/application/use-cases/create-project.use-case.ts"
echo "  $SRC/application/use-cases/create-milestone.use-case.ts"
echo "  $SRC/application/use-cases/update-milestone-status.use-case.ts"
echo "  $SRC/interfaces/controllers/project.controller.ts"
echo "  $SRC/interfaces/controllers/milestone.controller.ts"
echo ""
echo "Próximos passos:"
echo "  cd $ROOT && npm run build   # verificar se compila sem erros"
echo "  npm run start:dev           # subir o serviço"
echo "  Acesse o Swagger em: http://localhost:3002/api/docs"
echo ""
