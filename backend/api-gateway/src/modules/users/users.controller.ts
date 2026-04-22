import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  getMe(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.getMe(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  getById(@Param('id') id: string, @Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.getById(id, token);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  updateProfile(@Body() body: UpdateProfileDto, @Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.updateProfile(body, token);
  }
}
