import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
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
      throw new BadRequestException('O projeto deve estar no status SIGNING para que o contrato seja firmado');
    }

    project.contractHash = dto.contractHash;
    const now = new Date();

    if (dto.role === SignerRole.SPECIALIST) {
      if (project.specialistSignedAt) {
        throw new BadRequestException('O especialista já assinou este contrato');
      }
      project.specialistSignedAt = now;
      project.specialistSignedIp = dto.ipAddress ?? null;
      project.specialistSignedUserAgent = dto.userAgent ?? null;
    } else if (dto.role === SignerRole.COMPANY) {
      if (project.companySignedAt) {
        throw new BadRequestException('A empresa já assinou este contrato');
      }
      project.companySignedAt = now;
      project.companySignedIp = dto.ipAddress ?? null;
      project.companySignedUserAgent = dto.userAgent ?? null;
    }

    // Ambas as partes assinaram — projeto entra em andamento
    if (project.specialistSignedAt && project.companySignedAt) {
      project.status = ProjectStatus.IN_PROGRESS;
    }

    return await this.projectRepo.save(project);
  }
}
