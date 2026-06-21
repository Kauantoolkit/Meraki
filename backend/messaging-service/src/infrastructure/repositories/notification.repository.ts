import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    return this.findByUserIds([userId]);
  }

  async findByUserIds(userIds: string[]): Promise<Notification[]> {
    return this.repo.find({
      where: { userId: In(userIds) },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async countUnread(userIds: string | string[]): Promise<number> {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    return this.repo.count({ where: { userId: In(ids), read: false } });
  }

  async markAsRead(id: string, userIds: string | string[]): Promise<void> {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    await this.repo.update({ id, userId: In(ids) }, { read: true });
  }

  async markAllAsRead(userIds: string | string[]): Promise<void> {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    await this.repo.update({ userId: In(ids), read: false }, { read: true });
  }
}
