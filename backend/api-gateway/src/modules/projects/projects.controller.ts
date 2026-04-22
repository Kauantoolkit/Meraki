import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';

@ApiTags('Projects')
@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private token(req: Request): string {
    return req.headers.authorization?.split(' ')[1];
  }

  @Post()
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar projeto (empresa)' })
  create(@Body() body: CreateProjectDto, @Req() req: Request) {
    return this.projectsService.create(body, this.token(req));
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos' })
  findAll(@Query() query: ListProjectsQueryDto, @Req() req: Request) {
    return this.projectsService.findAll(query, this.token(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do projeto' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.findOne(id, this.token(req));
  }

  @Put(':id')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Atualizar projeto' })
  update(@Param('id') id: string, @Body() body: UpdateProjectDto, @Req() req: Request) {
    return this.projectsService.update(id, body, this.token(req));
  }

  @Delete(':id')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Cancelar projeto' })
  cancel(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.cancel(id, this.token(req));
  }

  @Post(':id/milestones')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Criar milestone do projeto' })
  createMilestone(@Param('id') id: string, @Body() body: CreateMilestoneDto, @Req() req: Request) {
    return this.projectsService.createMilestone(id, body, this.token(req));
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Listar milestones do projeto' })
  getMilestones(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.getMilestones(id, this.token(req));
  }

  @Put(':id/complete')
  @Roles('COMPANY')
  @ApiOperation({ summary: 'Concluir projeto — valida todas as milestones APPROVED' })
  complete(@Param('id') id: string, @Req() req: Request) {
    return this.projectsService.complete(id, this.token(req));
  }
}
