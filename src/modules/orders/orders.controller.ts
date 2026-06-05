import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OrderService } from './service/order.service';
import { CreateOrderDto, DisputeOrderDto } from './dto/order.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Orders & Escrow')
@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrderService) {}

 @Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Create order from cart' })
async createOrder(
  @CurrentUser() user: any,
  @Body() createOrderDto: CreateOrderDto,
) {
  return { orderId: 'o_1', paymentUrl: 'https://payment.example.com' };
}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user orders' })
  async getUserOrders(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.orderService.getBuyerOrders(user.id, pagination.page, pagination.perPage);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details with escrow timeline' })
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post(':id/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release escrow funds' })
  async releaseEscrow(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.releaseEscrow(id, user.id);
  }

  @Post(':id/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Open a dispute' })
  async disputeOrder(
    @Param('id') id: string,
    @Body() disputeOrderDto: DisputeOrderDto,
  ) {
    return this.orderService.disputeOrder(id, disputeOrderDto.reason, disputeOrderDto.evidence);
  }
}