import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { ProjectStatus } from '../../domain/enums/project-status.enum';
import { SignContractDto } from '../dto/sign-contract.dto';
import { SignerRole } from '../../domain/enums/signer-role.enum';

@Injectable()
export class SignProjectContractUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
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

    project.contractHash = dto.contractHash;

    if (dto.role === SignerRole.SPECIALIST) {
      project.specialistSignedAt = new Date();
    } else if (dto.role === SignerRole.COMPANY) {
      project.companySignedAt = new Date();
    }

    if (project.specialistSignedAt && project.companySignedAt) {
      project.status = ProjectStatus.IN_PROGRESS;
    }

    return await this.projectRepo.save(project);
  }
}
