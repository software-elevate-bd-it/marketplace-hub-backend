import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { DisputeOrderDto } from './dto/dispute-order.dto';

import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    buyerId: string,
    dto: CreateOrderDto,
  ) {
    const listing =
      await this.prisma.listing.findUnique({
        where: {
          id: dto.listingId,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found',
      );
    }

    const order =
      await this.prisma.order.create({
        data: {
          buyerId,
          sellerId: listing.sellerId,

          listingId: listing.id,

          listingTitle: listing.title,
          listingImage: listing.image,

          sellerName: 'Unknown Seller',

          amount: dto.amount,
          currency: dto.currency,

          status:
            OrderStatus.PENDING_PAYMENT,
        },
      });

    await this.addEvent(
      order.id,
      OrderStatus.PENDING_PAYMENT,
      'Order created',
    );

    return this.getOrderDetails(order.id);
  }

  async findAll(userId: string) {
    const orders =
      await this.prisma.order.findMany({
        where: {
          OR: [
            {
              buyerId: userId,
            },
            {
              sellerId: userId,
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return Promise.all(
      orders.map((order) =>
        this.getOrderDetails(order.id),
      ),
    );
  }

  async findOne(id: string) {
    return this.getOrderDetails(id);
  }

  async fundOrder(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.FUNDS_HELD,
      'Payment funded into escrow',
    );

    return this.getOrderDetails(id);
  }

  async markShipped(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.SHIPPED,
      'Seller marked order as shipped',
    );

    return this.getOrderDetails(id);
  }

  async markDelivered(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.DELIVERED,
      'Buyer confirmed delivery',
    );

    return this.getOrderDetails(id);
  }

  async releaseFunds(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.RELEASED,
      'Funds released to seller',
    );

    return this.getOrderDetails(id);
  }

  async refundOrder(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.REFUNDED,
      'Order refunded',
    );

    return this.getOrderDetails(id);
  }

  async cancelOrder(id: string) {
    await this.updateStatus(
      id,
      OrderStatus.CANCELLED,
      'Order cancelled',
    );

    return this.getOrderDetails(id);
  }

  async openDispute(
    id: string,
    dto: DisputeOrderDto,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: { id },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    await this.prisma.orderDispute.create({
      data: {
        orderId: id,
        reason: dto.reason,
        detail: dto.detail,
      },
    });

    await this.updateStatus(
      id,
      OrderStatus.DISPUTED,
      'Dispute opened',
    );

    return this.getOrderDetails(id);
  }

  private async updateStatus(
    orderId: string,
    status: OrderStatus,
    note: string,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: { id: orderId },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await this.addEvent(
      orderId,
      status,
      note,
    );
  }

  private async addEvent(
    orderId: string,
    status: string,
    note: string,
  ) {
    await this.prisma.orderEvent.create({
      data: {
        orderId,
        status,
        note,
      },
    });
  }

  async getOrderDetails(id: string) {
    const order =
      await this.prisma.order.findUnique({
        where: { id },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    const events =
      await this.prisma.orderEvent.findMany({
        where: {
          orderId: id,
        },
        orderBy: {
          at: 'asc',
        },
      });

    const dispute =
      await this.prisma.orderDispute.findFirst({
        where: {
          orderId: id,
        },
      });

    return {
      ...order,

      events: events.map((event) => ({
        at: event.at,
        status: event.status,
        note: event.note,
      })),

      dispute: dispute
        ? {
            openedAt: dispute.openedAt,
            reason: dispute.reason,
            detail: dispute.detail,
          }
        : null,
    };
  }
}