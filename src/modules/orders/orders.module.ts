import { Module } from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { OrderService } from './service/order.service';
import { OrdersController } from './orders.controller';

@Module({
  providers: [OrderRepository, OrderService],
  controllers: [OrdersController],
  exports: [OrderService],
})
export class OrdersModule {}