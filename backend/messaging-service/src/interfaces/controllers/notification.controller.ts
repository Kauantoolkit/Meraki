import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  async list(@Query('userId') userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepo.findByUserId(userId),
      this.notificationRepo.countUnread(userId),
    ]);
    return { notifications, unreadCount };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markRead(@Param('id') id: string, @Query('userId') userId: string) {
    await this.notificationRepo.markAsRead(id, userId);
    return { message: 'Notificação marcada como lida.' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas como lidas' })
  async markAllRead(@Query('userId') userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
    return { message: 'Todas as notificações marcadas como lidas.' };
  }
}
