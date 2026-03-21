import { Injectable } from '@nestjs/common';
import { Project } from '../entities/project.entity';
import { ProjectStatus } from '../enums/project-status.enum';
import { DomainException } from '../exceptions/domain.exception';
import { Budget } from '../value-objects/budget.value-object';
import { Deadline } from '../value-objects/deadline.value-object';

export interface CreateProjectData {
  title: string;
  description: string;
  requirements: string[];
  budget: number;
  deadline: string;
  companyId: string;
}

@Injectable()
export class ProjectFactory {
  /**
   * RN01: Projeto deve ter título (≥10 chars), budget > 0,
   *       deadline no futuro e pelo menos 1 requisito.
   * Value Objects Budget e Deadline encapsulam suas próprias validações.
   */
  create(data: CreateProjectData): Project {
    if (!data.title || data.title.trim().length < 10) {
      throw new DomainException('Título do projeto deve ter pelo menos 10 caracteres (RN01)');
    }
    if (!data.requirements || data.requirements.length === 0) {
      throw new DomainException('Projeto deve ter pelo menos um requisito (RN01)');
    }

    // Value Objects validam budget e deadline
    const budget = new Budget(data.budget);
    const deadline = new Deadline(data.deadline);

    const project = new Project();
    project.title = data.title.trim();
    project.description = data.description;
    project.requirements = data.requirements;
    project.budget = budget.getValue();
    project.deadline = deadline.getValue();
    project.companyId = data.companyId;
    project.status = ProjectStatus.OPEN;

    return project;
  }
}
