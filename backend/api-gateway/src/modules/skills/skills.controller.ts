import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1] ?? '';
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as skills (público)' })
  listAll() {
    return this.skillsService.listAll();
  }

  @Get('my-validations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Minhas validações de skills (especialista)' })
  getMyValidations(@Req() req: Request) {
    return this.skillsService.getMyValidations(this.token(req));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Empresa cria uma skill com questões iniciais' })
  createSkill(@Body() body: Record<string, unknown>, @Req() req: Request) {
    return this.skillsService.createSkill(body, this.token(req));
  }

  @Get(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar questões de uma skill (sem respostas)' })
  getQuestions(@Param('skillId') skillId: string, @Req() req: Request) {
    return this.skillsService.getQuestions(skillId, this.token(req));
  }

  @Post(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Empresa adiciona questões a uma skill' })
  addQuestions(
    @Param('skillId') skillId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    return this.skillsService.addQuestions(skillId, body, this.token(req));
  }

  @Post(':skillId/attempt')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SPECIALIST')
  @ApiOperation({ summary: 'Especialista tenta o quiz de uma skill' })
  attemptQuiz(
    @Param('skillId') skillId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    return this.skillsService.attemptQuiz(skillId, body, this.token(req));
  }
}
