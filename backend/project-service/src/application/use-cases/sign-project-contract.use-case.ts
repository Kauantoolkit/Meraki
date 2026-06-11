import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectStatus } from '../../domain/enums/project-status.enum';
import { SignContractDto } from '../dto/sign-contract.dto';

@Injectable()
export class SignProjectContractUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(projectId: string, dto: SignContractDto) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (project.status !== ProjectStatus.SIGNING) {
      throw new Error('O projeto deve estar no status SIGNING para que o contrato seja firmado');
    }

    project.contractSignedAt = new Date();
    project.contractHash = dto.contractHash;
    project.status = ProjectStatus.IN_PROGRESS;

    return await this.projectRepo.save(project);
  }
}
