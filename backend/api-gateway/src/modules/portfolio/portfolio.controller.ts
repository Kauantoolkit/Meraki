import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';
import { UpdatePortfolioProfileDto, UpdateCompanyProfileDto } from './dto/update-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { AddCertificationDto } from './dto/add-certification.dto';

@ApiTags('Portfolio')
@Controller('portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get('me')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Meu portfólio completo (RF12)' })
  getMyPortfolio(@Req() req: Request) {
    return this.portfolioService.getMyPortfolio(this.token(req));
  }

  @Patch('me')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Atualizar bio, skills e/ou avatar (especialista)' })
  updateProfile(@Body() body: UpdatePortfolioProfileDto, @Req() req: Request) {
    return this.portfolioService.updateProfile(body, this.token(req));
  }

  @Patch('me/company')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Atualizar avatar da empresa' })
  updateCompanyProfile(@Body() body: UpdateCompanyProfileDto, @Req() req: Request) {
    return this.portfolioService.updateCompanyProfile(body, this.token(req));
  }

  @Post('me/skills')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Adicionar habilidade' })
  addSkill(@Body() body: AddSkillDto, @Req() req: Request) {
    return this.portfolioService.addSkill(body, this.token(req));
  }

  @Post('me/certifications')
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Adicionar certificação' })
  addCertification(@Body() body: AddCertificationDto, @Req() req: Request) {
    return this.portfolioService.addCertification(body, this.token(req));
  }

  @Get('specialists')
  @ApiOperation({ summary: 'Listar todos os especialistas' })
  listSpecialists(@Req() req: Request) {
    return this.portfolioService.listSpecialists(this.token(req));
  }

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Perfil público do especialista (RF12)' })
  getSpecialistProfile(@Param('specialistId') specialistId: string, @Req() req: Request) {
    return this.portfolioService.getSpecialistProfile(specialistId, this.token(req));
  }

  @Get('specialist/:specialistId/history')
  @ApiOperation({ summary: 'Histórico profissional do especialista (RF11, RF14)' })
  getSpecialistHistory(@Param('specialistId') specialistId: string, @Req() req: Request) {
    return this.portfolioService.getSpecialistHistory(specialistId, this.token(req));
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Perfil público da empresa (RF13)' })
  getCompanyProfile(@Param('companyId') companyId: string, @Req() req: Request) {
    return this.portfolioService.getCompanyProfile(companyId, this.token(req));
  }
}

@ApiTags('Certifications')
@Controller('certifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CertificationsController {
  constructor(private readonly portfolioService: PortfolioService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Listar certificações do especialista' })
  listCertifications(@Param('specialistId') specialistId: string, @Req() req: Request) {
    return this.portfolioService.listCertifications(specialistId, this.token(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover certificação' })
  deleteCertification(@Param('id') id: string, @Req() req: Request) {
    return this.portfolioService.deleteCertification(id, this.token(req));
  }
}

@ApiTags('Reviews')
@Controller('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly portfolioService: PortfolioService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Avaliações do especialista' })
  listReviews(@Param('specialistId') specialistId: string, @Req() req: Request) {
    return this.portfolioService.listReviews(specialistId, this.token(req));
  }

  @Post()
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Submeter avaliação (empresa)' })
  createReview(@Body() body: Record<string, unknown>, @Req() req: Request) {
    return this.portfolioService.createReview(body, this.token(req));
  }
}

@ApiTags('Certifications')
@Controller('certifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificationsController {
  constructor(private readonly portfolioService: PortfolioService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Certificações do especialista' })
  listCertifications(@Param('specialistId') specialistId: string, @Req() req: Request) {
    return this.portfolioService.listCertifications(specialistId, this.token(req));
  }
}
