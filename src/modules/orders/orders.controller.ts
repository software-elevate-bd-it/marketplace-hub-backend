import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { DisputeOrderDto } from './dto/dispute-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

 @Post()
@UseGuards(JwtAuthGuard)
create(
  @CurrentUser('id') buyerId: string,

  @Body()
  dto: CreateOrderDto,
) {
  return this.ordersService.create(
    buyerId,
    dto,
  );
}

  @Get()
  findAll() {
    const userId = 'temp-user-id';

    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/fund')
  fund(@Param('id') id: string) {
    return this.ordersService.fundOrder(id);
  }

  @Post(':id/mark-shipped')
  markShipped(
    @Param('id') id: string,
  ) {
    return this.ordersService.markShipped(
      id,
    );
  }

  @Post(':id/mark-delivered')
  markDelivered(
    @Param('id') id: string,
  ) {
    return this.ordersService.markDelivered(
      id,
    );
  }

  @Post(':id/release-funds')
  releaseFunds(
    @Param('id') id: string,
  ) {
    return this.ordersService.releaseFunds(
      id,
    );
  }

  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refundOrder(
      id,
    );
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancelOrder(
      id,
    );
  }

  @Post(':id/dispute')
  dispute(
    @Param('id') id: string,
    @Body() dto: DisputeOrderDto,
  ) {
    return this.ordersService.openDispute(
      id,
      dto,
    );
  }
}