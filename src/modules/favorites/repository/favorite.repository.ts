import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class FavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.favorite.create({ data });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.favorite.findUnique({ where: { id: toPrismaId(id) } });
  }

  async findByUserAndListing(userId: string | number | bigint, listingId: string | number | bigint) {
    return this.prisma.favorite.findFirst({ where: { userId: toPrismaId(userId), listingId: toPrismaId(listingId) } });
  }

  async findByUserId(userId: string | number | bigint, skip: number = 0, take: number = 20) {
    return this.prisma.favorite.findMany({
      where: { userId: toPrismaId(userId) },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string | number | bigint) {
    return this.prisma.favorite.delete({ where: { id: toPrismaId(id) } });
  }

  async deleteByUserAndListing(userId: string | number | bigint, listingId: string | number | bigint) {
    return this.prisma.favorite.deleteMany({ where: { userId: toPrismaId(userId), listingId: toPrismaId(listingId) } });
  }

  async countByUser(userId: string | number | bigint) {
    return this.prisma.favorite.count({ where: { userId: toPrismaId(userId) } });
  }

  async isFavored(userId: string, listingId: string) {
    const favorite = await this.findByUserAndListing(userId, listingId);
    return !!favorite;
  }
}
