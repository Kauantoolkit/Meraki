import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@ApiExcludeController()
@Controller('internal/users')
@UseGuards(ApiKeyGuard)
export class InternalUserController {
  constructor(private readonly userRepo: UserRepository) {}

  @Get('by-specialist/:specialistId')
  async findBySpecialistId(@Param('specialistId') specialistId: string) {
    const user = await this.userRepo.findBySpecialistId(specialistId);
    if (!user) throw new NotFoundException('Usuário não encontrado para este specialistId');
    return { id: user.id, name: user.name, email: user.email };
  }
}
