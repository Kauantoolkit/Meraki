import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const MESSAGING_URL = process.env.MESSAGING_SERVICE_URL as string;

@Injectable()
export class NotificationsService {
  constructor(private readonly proxy: HttpProxyService) {}

  list(userId: string) {
    return this.proxy.get(`${MESSAGING_URL}/api/notifications?userId=${userId}`);
  }

  markAsRead(id: string, userId: string) {
    return this.proxy.patch(`${MESSAGING_URL}/api/notifications/${id}/read?userId=${userId}`, {});
  }

  markAllAsRead(userId: string) {
    return this.proxy.patch(`${MESSAGING_URL}/api/notifications/read-all?userId=${userId}`, {});
  }
}
