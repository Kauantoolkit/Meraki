import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectStatus } from '../../domain/enums/project-status.enum';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(id: string, dto: UpdateProjectDto, companyId: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundException('Projeto não encontrado');
    if (project.companyId !== companyId) throw new ForbiddenException('Não autorizado');
    if (project.status !== ProjectStatus.OPEN) {
      throw new ForbiddenException('Só é possível editar projetos OPEN');
    }

    Object.assign(project, {
      ...(dto.title && { title: dto.title }),
      ...(dto.description && { description: dto.description }),
      ...(dto.requirements && { requirements: dto.requirements }),
      ...(dto.budget && { budget: dto.budget }),
      ...(dto.deadline && { deadline: new Date(dto.deadline) }),
    });

    return this.projectRepo.save(project);
  }
}
