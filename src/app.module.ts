import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';

import { ListingsModule } from './modules/listings/listings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    ListingsModule,
    OrdersModule,
    ChatModule,
  ],
})
export class AppModule {}