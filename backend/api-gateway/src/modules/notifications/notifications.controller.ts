import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  list(@Req() req: any) {
    const userIds = this.collectUserIds(req.user);
    return this.notificationsService.list(userIds);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  markAsRead(@Param('id') id: string, @Req() req: any) {
    const userIds = this.collectUserIds(req.user);
    return this.notificationsService.markAsRead(id, userIds);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas como lidas' })
  markAllAsRead(@Req() req: any) {
    const userIds = this.collectUserIds(req.user);
    return this.notificationsService.markAllAsRead(userIds);
  }

  private collectUserIds(user: any): string[] {
    const ids = [user.id];
    if (user.companyId) ids.push(user.companyId);
    if (user.specialistId) ids.push(user.specialistId);
    return ids;
  }
}
