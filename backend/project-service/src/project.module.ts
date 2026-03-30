import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Domain
import { Project } from './domain/entities/project.entity';
import { Milestone } from './domain/entities/milestone.entity';
import { ProjectFactory } from './domain/factories/project.factory';
import { MilestoneFactory } from './domain/factories/milestone.factory';

// Infrastructure
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { ProjectRepository } from './infrastructure/repositories/project.repository';
import { MilestoneRepository } from './infrastructure/repositories/milestone.repository';

// Application
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

// Interfaces
import { ProjectController } from './interfaces/controllers/project.controller';
import { MilestoneController } from './interfaces/controllers/milestone.controller';

// Event consumer (bid.accepted)
import { BidAcceptedConsumer } from './infrastructure/rabbitmq/bid-accepted.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Milestone]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [ProjectController, MilestoneController],
  providers: [
    // Auth
    JwtStrategy,
    // Factories
    ProjectFactory,
    MilestoneFactory,
    // Repositories
    ProjectRepository,
    MilestoneRepository,
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
    // Event consumer
    BidAcceptedConsumer,
  ],
})
export class ProjectModule {}
