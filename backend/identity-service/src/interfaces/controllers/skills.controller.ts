import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserType } from '../../domain/enums/user-type.enum';

import { CreateSkillUseCase, CreateSkillDto } from '../../application/use-cases/create-skill.use-case';
import { AddQuestionsToSkillUseCase } from '../../application/use-cases/add-questions-to-skill.use-case';
import { GetSkillsUseCase } from '../../application/use-cases/get-skills.use-case';
import { GetMySkillValidationsUseCase } from '../../application/use-cases/get-my-skill-validations.use-case';
import { AttemptProfileSkillQuizUseCase } from '../../application/use-cases/attempt-profile-skill-quiz.use-case';
import { AttemptProjectSkillQuizUseCase } from '../../application/use-cases/attempt-project-skill-quiz.use-case';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';

interface AuthenticatedUser {
  id: string;
  userType: UserType;
  specialistId?: string;
  companyId?: string;
}

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly getSkillsUseCase: GetSkillsUseCase,
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly addQuestionsUseCase: AddQuestionsToSkillUseCase,
    private readonly attemptProfileQuizUseCase: AttemptProfileSkillQuizUseCase,
    private readonly attemptProjectQuizUseCase: AttemptProjectSkillQuizUseCase,
    private readonly getMyValidationsUseCase: GetMySkillValidationsUseCase,

    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as skills do catálogo' })
  listSkills() {
    return this.getSkillsUseCase.execute();
  }

  // IMPORTANT: this must be declared BEFORE /:skillId/... routes
  @Get('my-validations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SPECIALIST)
  @ApiOperation({ summary: 'Minhas validações de skills' })
  getMyValidations(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyValidationsUseCase.execute(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @ApiOperation({ summary: 'Criar skill com questões iniciais (empresa)' })
  createSkill(@Body() dto: CreateSkillDto, @CurrentUser() user: AuthenticatedUser) {
    return this.createSkillUseCase.execute(dto, user.companyId ?? user.id);
  }

  @Patch('questions/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @ApiOperation({ summary: 'Editar uma questão (empresa)' })
  async updateQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() body: { text?: string; options?: string[]; correctIndex?: number },
  ) {
    return this.skillRepo.updateQuestion(questionId, body);
  }

  @Delete('questions/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @ApiOperation({ summary: 'Soft delete de uma questão (empresa)' })
  async deleteQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    await this.skillRepo.softDeleteQuestion(questionId);
    return { ok: true };
  }

  @Post(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @ApiOperation({ summary: 'Adicionar mais questões a uma skill (empresa)' })
  addQuestions(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() body: { questions: Array<{ text: string; options: string[]; correctIndex: number }> },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addQuestionsUseCase.execute(skillId, body.questions, user.companyId ?? user.id);
  }

  @Get(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @ApiOperation({ summary: 'Listar todas as questões de uma skill (empresa)' })
  async getQuestions(@Param('skillId', ParseUUIDPipe) skillId: string) {
    return this.skillRepo.getQuestionsBySkillId(skillId);
  }

  @Get(':skillId/questions/random')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Questões aleatórias para quiz de perfil (sem correctIndex)' })
  async getRandomQuestions(@Param('skillId', ParseUUIDPipe) skillId: string) {
    const questions = await this.skillRepo.getRandomQuestionsForSkill(skillId, 10);
    // Return without correctIndex to prevent cheating
    return questions.map(q => ({
      id: q.id,
      skillId: q.skillId,
      text: q.text,
      options: q.options,
    }));
  }

  @Get(':skillId/questions/by-company/:companyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Questões de uma empresa específica para gate de proposta (sem correctIndex)' })
  async getCompanyQuestions(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Param('companyId') companyId: string,
  ) {
    const questions = await this.skillRepo.getQuestionsBySkillAndCompany(skillId, companyId);
    return questions.map(q => ({
      id: q.id,
      skillId: q.skillId,
      text: q.text,
      options: q.options,
    }));
  }

  @Post(':skillId/attempt-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SPECIALIST)
  @ApiOperation({ summary: 'Tentar quiz de validação de skill para o perfil' })
  attemptProfileQuiz(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() body: { answers: number[]; questionIds: string[] },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!body.answers || !Array.isArray(body.answers)) {
      throw new BadRequestException('Campo "answers" é obrigatório e deve ser um array');
    }
    if (!body.questionIds || !Array.isArray(body.questionIds)) {
      throw new BadRequestException('Campo "questionIds" é obrigatório e deve ser um array');
    }
    return this.attemptProfileQuizUseCase.execute(skillId, body.answers, user.id, body.questionIds);
  }

  @Post(':skillId/attempt-project')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SPECIALIST)
  @ApiOperation({ summary: 'Tentar quiz de gate de proposta (não cria SkillValidation)' })
  attemptProjectQuiz(
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() body: { answers: number[]; companyId: string; questionIds: string[] },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!body.answers || !Array.isArray(body.answers)) {
      throw new BadRequestException('Campo "answers" é obrigatório e deve ser um array');
    }
    if (!body.companyId) {
      throw new BadRequestException('Campo "companyId" é obrigatório');
    }
    if (!body.questionIds || !Array.isArray(body.questionIds)) {
      throw new BadRequestException('Campo "questionIds" é obrigatório e deve ser um array');
    }
    return this.attemptProjectQuizUseCase.execute(skillId, body.answers, body.companyId, body.questionIds);
  }
}
