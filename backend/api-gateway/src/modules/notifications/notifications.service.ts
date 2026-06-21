import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const MESSAGING_URL = process.env.MESSAGING_SERVICE_URL as string;

@Injectable()
export class NotificationsService {
  constructor(private readonly proxy: HttpProxyService) {}

  list(userIds: string[]) {
    return this.proxy.get(`${MESSAGING_URL}/api/notifications?userIds=${userIds.join(',')}`);
  }

  markAsRead(id: string, userIds: string[]) {
    return this.proxy.patch(`${MESSAGING_URL}/api/notifications/${id}/read?userIds=${userIds.join(',')}`, {});
  }

  markAllAsRead(userIds: string[]) {
    return this.proxy.patch(`${MESSAGING_URL}/api/notifications/read-all?userIds=${userIds.join(',')}`, {});
  }
}
