import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, read: false }, { read: true });
  }
}
