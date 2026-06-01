import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateListingDto,
  ) {
    return this.prisma.listing.create({
      data: {
        sellerId: userId,
        ...dto,
      },
    });
  }

  async findAll(query: QueryListingDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    const skip = (page - 1) * limit;

    const where: any = {};

    // search
    if (query.q) {
      where.OR = [
        {
          title: {
            contains: query.q,
          },
        },
        {
          description: {
            contains: query.q,
          },
        },
      ];
    }

    // category
    if (query.category) {
      where.category = query.category;
    }

    // country
    if (query.country) {
      where.country = query.country;
    }

    // location
    if (query.location) {
      where.location = query.location;
    }

    // price filter
    if (query.minPrice || query.maxPrice) {
      where.price = {};
    }

    if (query.minPrice) {
      where.price.gte = Number(query.minPrice);
    }

    if (query.maxPrice) {
      where.price.lte = Number(query.maxPrice);
    }

    // sorting
    let orderBy: any = {
      createdAt: 'desc',
    };

    if (query.sort === 'price_asc') {
      orderBy = {
        price: 'asc',
      };
    }

    if (query.sort === 'price_desc') {
      orderBy = {
        price: 'desc',
      };
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),

      this.prisma.listing.count({
        where,
      }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const listing =
      await this.prisma.listing.findUnique({
        where: { id },
      });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found',
      );
    }

    return listing;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateListingDto,
  ) {
    const listing =
      await this.prisma.listing.findUnique({
        where: { id },
      });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found',
      );
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    return this.prisma.listing.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const listing =
      await this.prisma.listing.findUnique({
        where: { id },
      });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found',
      );
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    await this.prisma.listing.delete({
      where: { id },
    });

    return {};
  }
}