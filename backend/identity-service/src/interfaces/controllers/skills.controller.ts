import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserType } from '../../domain/enums/user-type.enum';
import { CreateSkillUseCase } from '../../application/use-cases/create-skill.use-case';
import { AddSkillQuestionsUseCase } from '../../application/use-cases/add-skill-questions.use-case';
import { AttemptSkillQuizUseCase } from '../../application/use-cases/attempt-skill-quiz.use-case';
import { ISkillRepository } from '../../domain/repositories/skill.repository.interface';
import { CreateSkillDto, AddQuestionsDto, AttemptQuizDto } from '../../application/dto/skill.dto';

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
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly addQuestionsUseCase: AddSkillQuestionsUseCase,
    private readonly attemptQuizUseCase: AttemptSkillQuizUseCase,
    @Inject('ISkillRepository')
    private readonly skillRepo: ISkillRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as skills (público)' })
  @ApiResponse({ status: 200, description: 'Lista de skills' })
  listAll() {
    return this.skillRepo.findAllSkills();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Empresa cria uma nova skill com questões iniciais' })
  @ApiResponse({ status: 201, description: 'Skill criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Skill já existe' })
  createSkill(
    @Body() dto: CreateSkillDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createSkillUseCase.execute(dto, user.companyId ?? user.id);
  }

  @Get('my-validations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SPECIALIST)
  @ApiOperation({ summary: 'Especialista consulta suas validações' })
  @ApiResponse({ status: 200, description: 'Lista de validações do especialista' })
  getMyValidations(@CurrentUser() user: AuthenticatedUser) {
    return this.skillRepo.findValidationsBySpecialistId(
      user.specialistId ?? user.id,
    );
  }

  @Get(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar questões de uma skill (sem resposta correta)' })
  @ApiResponse({ status: 200, description: 'Questões sem correctIndex' })
  @ApiResponse({ status: 404, description: 'Skill não encontrada' })
  async getQuestions(@Param('skillId') skillId: string) {
    const questions = await this.skillRepo.findQuestionsBySkillId(skillId);
    // Omit correctIndex — specialists must not see answers
    return questions.map(({ correctIndex: _ci, ...q }) => q);
  }

  @Post(':skillId/questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Empresa adiciona questões a uma skill existente' })
  @ApiResponse({ status: 201, description: 'Questões adicionadas' })
  addQuestions(
    @Param('skillId') skillId: string,
    @Body() dto: AddQuestionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addQuestionsUseCase.execute(skillId, dto, user.companyId ?? user.id);
  }

  @Post(':skillId/attempt')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.SPECIALIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Especialista tenta o quiz de uma skill' })
  @ApiResponse({ status: 200, description: 'Resultado do quiz' })
  @ApiResponse({ status: 400, description: 'Número de respostas incorreto' })
  @ApiResponse({ status: 404, description: 'Skill não encontrada' })
  attemptQuiz(
    @Param('skillId') skillId: string,
    @Body() dto: AttemptQuizDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptQuizUseCase.execute(skillId, dto, user.specialistId ?? user.id);
  }
}
