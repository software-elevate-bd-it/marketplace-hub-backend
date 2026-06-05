import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { EventsModule } from './common/events/events.module';
import { QueueModule } from './common/queue/queue.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { RateLimitGuard } from './common/rate-limit/rate-limit.guard';
import { SlowQueryMiddleware } from './common/logging/slow-query.middleware';

// Existing modules
import { AuthModule } from './modules/auth/auth.module';
import { ListingsModule } from './modules/listings/listings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ChatModule } from './modules/chat/chat.module';
import { UsersModule } from './modules/users/users.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';

// New production modules
import { AdminModule } from './modules/admin/admin.module';
import { CategoryManagementModule } from './modules/category-management/category-management.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { CMSModule } from './modules/cms/cms.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    EventsModule,
    QueueModule,
    RateLimitModule,
    AuthModule,
    ListingsModule,
    OrdersModule,
    ChatModule,
    UsersModule,
    FavoritesModule,
    CartModule,
    CategoriesModule,
    AdminModule,
    CategoryManagementModule,
    NotificationsModule,
    ReviewsModule,
    DisputesModule,
    CMSModule,
    LocalizationModule,
    ModerationModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SlowQueryMiddleware).forRoutes('*');
  }
}