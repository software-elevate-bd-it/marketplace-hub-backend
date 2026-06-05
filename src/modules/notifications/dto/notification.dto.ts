import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export enum NotificationTypeEnum {
  NEW_MESSAGE = 'new_message',
  ORDER_UPDATE = 'order_update',
  LISTING_APPROVED = 'listing_approved',
  LISTING_REJECTED = 'listing_rejected',
  DISPUTE_UPDATE = 'dispute_update',
  REVIEW_RECEIVED = 'review_received',
  PAYMENT_RECEIVED = 'payment_received',
}

export class SendNotificationDto {
  @ApiProperty()
  @IsEmail()
  userId: string;

  @ApiProperty({ enum: NotificationTypeEnum })
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: Record<string, any>;
}

export class MarkNotificationAsReadDto {
  @ApiProperty()
  @IsOptional()
  notificationId?: string;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  type: NotificationTypeEnum;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
