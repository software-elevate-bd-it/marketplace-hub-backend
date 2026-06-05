import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: any) {
    return this.prisma.notification.create({ data });
  }

  async findNotificationById(id: bigint) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findUserNotifications(userId: bigint, skip: number = 0, take: number = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async markAsRead(id: bigint) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: bigint) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async deleteNotification(id: bigint) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async countUnread(userId: bigint) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
