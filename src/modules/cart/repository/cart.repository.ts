import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class CartRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.cart.create({ data });
  }

  async findByUserId(userId: string | number | bigint) {
    return this.prisma.cart.findUnique({ where: { userId: toPrismaId(userId) } });
  }

  async update(userId: string | number | bigint, data: any) {
    return this.prisma.cart.update({ where: { userId: toPrismaId(userId) }, data });
  }

  async delete(userId: string | number | bigint) {
    return this.prisma.cart.delete({ where: { userId: toPrismaId(userId) } });
  }

  async addItem(userId: string | number | bigint, cartItem: any) {
    const cart = await this.findByUserId(userId);
    const items = Array.isArray(cart?.items) ? cart.items : [];
    if (!cart) {
      return this.create({ userId: toPrismaId(userId), items: [cartItem] });
    }
    return this.update(userId, { items: [...items, cartItem] });
  }

  async removeItem(userId: string | number | bigint, listingId: string) {
    const cart = await this.findByUserId(userId);
    if (!cart) return null;
    const items = (Array.isArray(cart.items) ? cart.items : []).filter((item: any) => item.listingId !== listingId);
    return this.update(userId, { items });
  }

  async updateItem(userId: string | number | bigint, listingId: string, qty: number) {
    const cart = await this.findByUserId(userId);
    if (!cart) return null;
    const items = (Array.isArray(cart.items) ? cart.items : []).map((item: any) =>
      item.listingId === listingId ? { ...item, qty } : item,
    );
    return this.update(userId, { items });
  }

  async clearCart(userId: string | number | bigint) {
    return this.update(userId, { items: [] });
  }
}
