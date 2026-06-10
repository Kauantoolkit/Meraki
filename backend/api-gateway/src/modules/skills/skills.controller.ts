import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1] ?? '';
  }

  @Get()
  @ApiOperation({ summary: 'Listar catálogo de skills (público)' })
  listSkills() {
    return this.skillsService.listSkills();
  }

  // IMPORTANT: declared before /:skillId routes to avoid conflict
  @Get('my-validations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Minhas validações de skills' })
  getMyValidations(@Req() req: Request) {
    return this.skillsService.getMyValidations(this.token(req));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar skill com questões (empresa)' })
  createSkill(@Body() body: Record<string, unknown>, @Req() req: Request) {
    return this.skillsService.createSkill(body, this.token(req));
  }

  @Post(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Adicionar questões a uma skill (empresa)' })
  addQuestions(
    @Param('skillId') skillId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    return this.skillsService.addQuestions(skillId, body, this.token(req));
  }

  @Get(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Listar todas as questões de uma skill (empresa)' })
  getQuestions(@Param('skillId') skillId: string, @Req() req: Request) {
    return this.skillsService.getQuestions(skillId, this.token(req));
  }

  @Get(':skillId/questions/random')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Questões aleatórias para quiz de perfil' })
  getRandomQuestions(@Param('skillId') skillId: string, @Req() req: Request) {
    return this.skillsService.getRandomQuestions(skillId, this.token(req));
  }

  @Get(':skillId/questions/by-company/:companyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Questões de empresa específica para gate de proposta' })
  getCompanyQuestions(
    @Param('skillId') skillId: string,
    @Param('companyId') companyId: string,
    @Req() req: Request,
  ) {
    return this.skillsService.getCompanyQuestions(skillId, companyId, this.token(req));
  }

  @Post(':skillId/attempt-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Tentar quiz de validação de skill para o perfil' })
  attemptProfileQuiz(
    @Param('skillId') skillId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    return this.skillsService.attemptProfileQuiz(skillId, body, this.token(req));
  }

  @Post(':skillId/attempt-project')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Tentar quiz de gate de proposta' })
  attemptProjectQuiz(
    @Param('skillId') skillId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    return this.skillsService.attemptProjectQuiz(skillId, body, this.token(req));
  }
}
