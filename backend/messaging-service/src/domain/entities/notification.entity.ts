export class Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
}
