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
import { GetMyPortfolioUseCase } from '../../application/use-cases/get-my-portfolio.use-case';
import { SpecialistProfileRepository } from '../../infrastructure/repositories/specialist-profile.repository';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
  AddCertificationDto,
  CreateReviewDto,
  UpdateMyProfileDto,
  AddSkillDto,
  AddMyCertificationDto,
} from '../dtos/portfolio.dto';

interface AuthUser {
  sub: string;
  specialistId?: string;
}

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
  create(@Body() body: CreatePortfolioItemDto) {
    return this.getPortfolioUseCase.create({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar item de portfólio' })
  update(@Param('id') id: string, @Body() body: UpdatePortfolioItemDto) {
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
  create(@Body() body: AddCertificationDto) {
    return this.addCertificationUseCase.execute({
      ...body,
      issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    });
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
  create(@Body() body: CreateReviewDto) {
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

  @Get('specialists')
  @ApiOperation({ summary: 'Listar todos os especialistas (RF12)' })
  listSpecialists() {
    return this.getPublicProfileUseCase.getAllSpecialists();
  }

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
    private readonly getMyPortfolioUseCase: GetMyPortfolioUseCase,
    private readonly profileRepo: SpecialistProfileRepository,
    private readonly addCertificationUseCase: AddCertificationUseCase,
  ) {}

  private specialistId(req: Request): string {
    return (req.user as AuthUser).specialistId ?? (req.user as AuthUser).sub;
  }

  @Get()
  @ApiOperation({ summary: 'Meu portfólio completo (especialista)' })
  getMyPortfolio(@Req() req: Request) {
    return this.getMyPortfolioUseCase.execute(this.specialistId(req));
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar bio e/ou skills' })
  async updateProfile(@Req() req: Request, @Body() body: UpdateMyProfileDto) {
    const specialistId = this.specialistId(req);
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    if (body.bio !== undefined) profile.bio = body.bio;
    if (body.skills !== undefined) profile.skills = body.skills;
    return this.profileRepo.save(profile);
  }

  @Post('skills')
  @ApiOperation({ summary: 'Adicionar habilidade' })
  async addSkill(@Req() req: Request, @Body() body: AddSkillDto) {
    const specialistId = this.specialistId(req);
    const profile = await this.profileRepo.findByUserId(specialistId);
    if (!profile) throw new NotFoundException('Perfil não encontrado');
    profile.skills = [...(profile.skills ?? []), body.skill];
    return this.profileRepo.save(profile);
  }

  @Post('certifications')
  @ApiOperation({ summary: 'Adicionar certificação ao meu perfil' })
  addCertification(@Req() req: Request, @Body() body: AddMyCertificationDto) {
    const specialistId = this.specialistId(req);
    return this.addCertificationUseCase.execute({
      specialistId,
      name: body.title,
      issuer: body.institution,
      issueDate: body.issuedAt ? new Date(body.issuedAt) : undefined,
      credentialUrl: body.credentialUrl,
    });
  }
}
