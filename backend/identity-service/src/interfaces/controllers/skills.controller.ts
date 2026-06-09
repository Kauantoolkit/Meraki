import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetSkillsCatalogUseCase } from '../../application/use-cases/get-skills-catalog.use-case';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly getSkillsCatalogUseCase: GetSkillsCatalogUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Catálogo de skills disponíveis (público)' })
  @ApiResponse({ status: 200, description: 'Lista de skills ordenada alfabeticamente' })
  getCatalog(): Promise<string[]> {
    return this.getSkillsCatalogUseCase.execute();
  }
}
