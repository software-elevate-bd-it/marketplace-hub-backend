import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';

@Injectable()
export class ListingRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.listing.create({ data });
  }

  async findById(id: string | number | bigint) {
    return this.prisma.listing.findUnique({ where: { id: toPrismaId(id) } });
  }

  async findAll(skip: number = 0, take: number = 20, where?: any) {
    return this.prisma.listing.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        category: true,
        location: true,
        country: true,
        image: true,
        condition: true,
        createdAt: true,
      },
    });
  }

  async findByCategory(category: string | number | bigint, skip: number = 0, take: number = 20) {
    return this.prisma.listing.findMany({
      where: { categoryId: toPrismaId(category) },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        category: true,
        location: true,
        country: true,
        image: true,
        condition: true,
        createdAt: true,
      },
    });
  }

  async findByCountry(country: string, skip: number = 0, take: number = 20) {
    return this.prisma.listing.findMany({
      where: { country },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        category: true,
        location: true,
        country: true,
        image: true,
        condition: true,
        createdAt: true,
      },
    });
  }

  async search(query: string, skip: number = 0, take: number = 20, where?: any) {
    const searchWhere = {
      ...where,
      OR: [{ title: { contains: query } }, { description: { contains: query } }],
    };
    return this.prisma.listing.findMany({
      where: searchWhere,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        category: true,
        location: true,
        country: true,
        image: true,
        condition: true,
        createdAt: true,
      },
    });
  }

  async update(id: string | number | bigint, data: any) {
    return this.prisma.listing.update({ where: { id: toPrismaId(id) }, data });
  }

  async delete(id: string | number | bigint) {
    return this.prisma.listing.delete({ where: { id: toPrismaId(id) } });
  }

  async count(where?: any) {
    return this.prisma.listing.count({ where });
  }

  async findBySeller(sellerId: string | number | bigint, skip: number = 0, take: number = 20) {
    return this.prisma.listing.findMany({
      where: { sellerId: toPrismaId(sellerId) },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
