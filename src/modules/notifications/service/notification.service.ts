import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { SendNotificationDto } from '../dto/notification.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { CacheService } from 'src/common/cache/cache.service';
import { EventsService } from 'src/common/events/events.service';

@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private readonly cacheService: CacheService,
    private readonly eventsService: EventsService,
  ) {}

  async createNotification(dto: SendNotificationDto): Promise<SuccessResponse> {
    try {
      const notification = await this.notificationRepository.createNotification({
        userId: BigInt(dto.userId),
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
      });

      const unreadCacheKey = `notifications:unread:${dto.userId}`;
      await this.cacheService.del(unreadCacheKey);
      await this.eventsService.publish('notification.triggered', {
        userId: dto.userId,
        notificationId: notification.id,
        type: dto.type,
      });

      return new SuccessResponse('Notification created', notification);
    } catch (error) {
      console.error('Notification creation failed:', error);
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async getUserNotifications(userId: string | number | bigint, page: number = 1, limit: number = 20): Promise<SuccessResponse> {
    try {
      const skip = (page - 1) * limit;
      const notifications = await this.notificationRepository.findUserNotifications(BigInt(userId), skip, limit);

      const unreadCacheKey = `notifications:unread:${userId}`;
      let unreadCount = await this.cacheService.get<number>(unreadCacheKey);
      if (unreadCount === undefined) {
        unreadCount = await this.notificationRepository.countUnread(BigInt(userId));
        await this.cacheService.set(unreadCacheKey, unreadCount, 600);
      }

      return new SuccessResponse('Notifications retrieved', { notifications, unreadCount });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve notifications');
    }
  }

  async markAsRead(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      const notification = await this.notificationRepository.markAsRead(BigInt(id));
      const unreadCacheKey = `notifications:unread:${notification.userId}`;
      await this.cacheService.del(unreadCacheKey);
      return new SuccessResponse('Notification marked as read', notification);
    } catch (error) {
      throw new InternalServerErrorException('Failed to mark notification');
    }
  }

  async markAllAsRead(userId: string | number | bigint): Promise<SuccessResponse> {
    try {
      await this.notificationRepository.markAllAsRead(BigInt(userId));
      const unreadCacheKey = `notifications:unread:${userId}`;
      await this.cacheService.del(unreadCacheKey);
      return new SuccessResponse('All notifications marked as read', {});
    } catch (error) {
      throw new InternalServerErrorException('Failed to mark notifications');
    }
  }

  async deleteNotification(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      await this.notificationRepository.deleteNotification(BigInt(id));
      return new SuccessResponse('Notification deleted', { id });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }
}
