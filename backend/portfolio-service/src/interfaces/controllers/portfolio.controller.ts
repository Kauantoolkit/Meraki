import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GetPortfolioUseCase } from '../../application/use-cases/get-portfolio.use-case';
import { AddCertificationUseCase } from '../../application/use-cases/add-certification.use-case';
import { AddReviewUseCase } from '../../application/use-cases/add-review.use-case';
import { GetPublicProfileUseCase } from '../../application/use-cases/get-public-profile.use-case';
import { GetCompanyProfileUseCase } from '../../application/use-cases/get-company-profile.use-case';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import { CertificationRepository } from '../../infrastructure/repositories/certification.repository';
import { ReviewRepository } from '../../infrastructure/repositories/review.repository';
import { WorkHistoryRepository } from '../../infrastructure/repositories/work-history.repository';
import { SpecialistPublicProfile } from '../../domain/entities/specialist-public-profile.entity';

// ─── Portfolio ──────────────────────────────────────────────────────────────

@ApiTags('Portfolio')
@Controller('api/portfolio')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Portfólio do especialista' })
  getBySpecialist(@Param('specialistId') specialistId: string) {
    return this.getPortfolioUseCase.findBySpecialist(specialistId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar item de portfólio (especialista)' })
  create(@Body() body: any) {
    return this.getPortfolioUseCase.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar item de portfólio' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.getPortfolioUseCase.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover item de portfólio' })
  remove(@Param('id') id: string) {
    return this.getPortfolioUseCase.delete(id);
  }
}

// ─── Certifications ─────────────────────────────────────────────────────────

@ApiTags('Certifications')
@Controller('api/certifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class CertificationController {
  constructor(private readonly addCertificationUseCase: AddCertificationUseCase) {}

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Certificações do especialista' })
  getBySpecialist(@Param('specialistId') specialistId: string) {
    return this.addCertificationUseCase.findBySpecialist(specialistId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar certificação' })
  create(@Body() body: any) {
    return this.addCertificationUseCase.execute(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.addCertificationUseCase.remove(id);
  }
}

// ─── Reviews ────────────────────────────────────────────────────────────────

@ApiTags('Reviews')
@Controller('api/reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ReviewController {
  constructor(private readonly addReviewUseCase: AddReviewUseCase) {}

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Avaliações do especialista' })
  getBySpecialist(@Param('specialistId') specialistId: string) {
    return this.addReviewUseCase.findBySpecialist(specialistId);
  }

  @Post()
  @ApiOperation({ summary: 'Submeter avaliação (empresa)' })
  create(@Body() body: any) {
    return this.addReviewUseCase.execute(body);
  }
}

// ─── Public Profiles — RF12, RF13, RF14 ─────────────────────────────────────

@ApiTags('Public Profiles')
@Controller('api/profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PublicProfileController {
  constructor(
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
    private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
  ) {}

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Perfil público do especialista (RF12)' })
  getSpecialist(@Param('specialistId') specialistId: string) {
    return this.getPublicProfileUseCase.getSpecialistProfile(specialistId);
  }

  @Get('specialist/:specialistId/history')
  @ApiOperation({ summary: 'Histórico profissional do especialista (RF11, RF14)' })
  getHistory(@Param('specialistId') specialistId: string) {
    return this.getPublicProfileUseCase.getWorkHistory(specialistId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Perfil público da empresa (RF13)' })
  getCompany(@Param('companyId') companyId: string) {
    return this.getCompanyProfileUseCase.execute(companyId);
  }
}

// ─── My Portfolio (autenticado) ──────────────────────────────────────────────

@ApiTags('My Portfolio')
@Controller('api/portfolio/me')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class MyPortfolioController {
  constructor(
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly certRepo: CertificationRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly historyRepo: WorkHistoryRepository,
  ) {}

  private specialistId(req: Request): string {
    return (req.user as any).specialistId;
  }

  @Get()
  @ApiOperation({ summary: 'Meu portfólio completo (especialista)' })
  async getMyPortfolio(@Req() req: Request) {
    const specialistId = this.specialistId(req);
    let profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) {
      // Auto-create a blank profile on first access
      const blank = new SpecialistPublicProfile();
      blank.userId = specialistId;
      profile = await this.profileRepo.save(blank);
    }
    const [certifications, reviews, history] = await Promise.all([
      this.certRepo.findBySpecialist(specialistId),
      this.reviewRepo.findBySpecialist(specialistId),
      this.historyRepo.findBySpecialist(specialistId),
    ]);
    return {
      id: profile.id,
      specialistId: profile.userId,
      bio: profile.bio ?? '',
      skills: profile.skills ?? [],
      rating: Number(profile.rating ?? 0),
      completedProjects: profile.completedProjects ?? 0,
      certifications: certifications.map((c) => ({
        id: c.id,
        title: c.name,
        institution: c.issuer,
        issuedAt: c.issueDate ? c.issueDate.toISOString() : new Date().toISOString(),
        credentialUrl: c.credentialUrl ?? null,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerName: 'Anônimo',
        rating: r.rating,
        comment: r.comment ?? '',
        createdAt: r.createdAt,
      })),
      workHistory: history.map((h) => ({
        id: h.id,
        projectId: h.projectId,
        projectTitle: h.projectTitle ?? '',
        companyName: h.companyId ?? '',
        earnedAmount: Number(h.amountEarned ?? 0),
        completedAt: h.completedAt ? h.completedAt.toISOString() : '',
      })),
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar bio e/ou skills' })
  async updateProfile(
    @Req() req: Request,
    @Body() body: { bio?: string; skills?: string[] },
  ) {
    const specialistId = this.specialistId(req);
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    if (body.bio !== undefined) profile.bio = body.bio;
    if (body.skills !== undefined) profile.skills = body.skills;
    return this.profileRepo.save(profile);
  }

  @Post('skills')
  @ApiOperation({ summary: 'Adicionar habilidade' })
  async addSkill(@Req() req: Request, @Body() body: { skill: string }) {
    const specialistId = this.specialistId(req);
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    profile.skills = [...(profile.skills ?? []), body.skill];
    return this.profileRepo.save(profile);
  }

  @Post('certifications')
  @ApiOperation({ summary: 'Adicionar certificação' })
  addCertification(@Req() req: Request, @Body() body: any) {
    const specialistId = this.specialistId(req);
    return this.certRepo.save({
      specialistId,
      name: body.title,
      issuer: body.institution,
      issueDate: body.issuedAt ? new Date(body.issuedAt) : new Date(),
      credentialUrl: body.credentialUrl,
    });
  }
}
