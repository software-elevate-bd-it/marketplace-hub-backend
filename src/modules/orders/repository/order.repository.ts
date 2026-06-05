import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.order.create({ data });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.order.findUnique({ where: { id: toPrismaId(id) } });
  }

  async findByBuyerId(buyerId: string | number | bigint, skip: number = 0, take: number = 20) {
    return this.prisma.order.findMany({
      where: { buyerId: toPrismaId(buyerId) },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySellerId(sellerId: string | number | bigint, skip: number = 0, take: number = 20) {
    return this.prisma.order.findMany({
      where: { sellerId: toPrismaId(sellerId) },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(skip: number = 0, take: number = 20) {
    return this.prisma.order.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
  }

  async update(id: string | number | bigint, data: any) {
    return this.prisma.order.update({ where: { id: toPrismaId(id) }, data });
  }

  async delete(id: string | number | bigint) {
    return this.prisma.order.delete({ where: { id: toPrismaId(id) } });
  }

  async countByBuyer(buyerId: string | number | bigint) {
    return this.prisma.order.count({ where: { buyerId: toPrismaId(buyerId) } });
  }

  async countBySeller(sellerId: string | number | bigint) {
    return this.prisma.order.count({ where: { sellerId: toPrismaId(sellerId) } });
  }

  async findByStatus(status: string, skip: number = 0, take: number = 20) {
    return this.prisma.order.findMany({
      where: { status: status as any },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
