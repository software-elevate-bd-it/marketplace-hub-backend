import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository';
import { toPrismaId } from 'src/common/utils/prisma-helpers';
import { CreateOrderDto, OrderResponseDto } from '../dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(
    buyerId: string | number | bigint,
    listingId: string | number | bigint,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.create({
      buyerId: toPrismaId(buyerId),
      listingId: toPrismaId(listingId),
      status: 'pending_payment',
      shippingAddress: createOrderDto.shippingAddress,
      paymentMethod: createOrderDto.paymentMethod,
    });

    return this.mapToResponseDto(order);
  }

  async getOrderById(id: string | number | bigint): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.mapToResponseDto(order);
  }

  async getBuyerOrders(buyerId: string | number | bigint, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [orders, total] = await Promise.all([
      this.orderRepository.findByBuyerId(buyerId, skip, perPage),
      this.orderRepository.countByBuyer(buyerId),
    ]);

    return {
      data: orders.map((order) => this.mapToResponseDto(order)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async getSellerOrders(sellerId: string | number | bigint, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [orders, total] = await Promise.all([
      this.orderRepository.findBySellerId(sellerId, skip, perPage),
      this.orderRepository.countBySeller(sellerId),
    ]);

    return {
      data: orders.map((order) => this.mapToResponseDto(order)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async updateOrderStatus(id: string | number | bigint, status: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.orderRepository.update(id, { status });
    return this.mapToResponseDto(updated);
  }

  async releaseEscrow(id: string | number | bigint, buyerId: string | number | bigint) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== toPrismaId(buyerId)) {
      throw new BadRequestException('You are not the buyer of this order');
    }

    return this.updateOrderStatus(id, 'released');
  }

  async disputeOrder(id: string | number | bigint, reason: string, evidence?: string[]) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create dispute logic here
    const updated = await this.orderRepository.update(id, { 
      status: 'disputed',
      disputeReason: reason,
      disputeEvidence: evidence,
    });

    return {
      disputeId: `d_${id}`,
      orderId: id,
      reason,
    };
  }

  private mapToResponseDto(order: any) {
    return {
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      listingId: order.listingId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
