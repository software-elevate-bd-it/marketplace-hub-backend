import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ListingRepository } from '../repository/listing.repository';
import { CacheService } from 'src/common/cache/cache.service';
import { EventsService } from 'src/common/events/events.service';
import { toPrismaId } from 'src/common/utils/prisma-helpers';
import {
  CreateListingDto,
  UpdateListingDto,
  QueryListingDto,
  ListingResponseDto,
} from '../dto/listing.dto';

@Injectable()
export class ListingService {
  constructor(
    private listingRepository: ListingRepository,
    private cacheService: CacheService,
    private eventsService: EventsService,
  ) {}

  async createListing(
    sellerId: string | number | bigint,
    createListingDto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingRepository.create({
      sellerId: toPrismaId(sellerId),
      title: createListingDto.title,
      price: createListingDto.price,
      currency: createListingDto.currency,
      category: createListingDto.category,
      location: createListingDto.location,
      country: createListingDto.country,
      description: createListingDto.description,
      condition: createListingDto.condition,
      image: createListingDto.images[0] || null,
      images: createListingDto.images,
      attributes: createListingDto.attributes,
    });

    await this.cacheService.del('listings:top-picks');
    await this.cacheService.del('listings:recent');

    await this.eventsService.publish('listing.created', {
      listingId: listing.id,
      sellerId,
      category: listing.categoryId,
      createdAt: listing.createdAt,
    });

    return this.mapToResponseDto(listing);
  }

  async getListingById(id: string): Promise<ListingResponseDto> {
    const listing = await this.listingRepository.findById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return this.mapToResponseDto(listing);
  }

  async searchListings(query: QueryListingDto, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const cacheKey = `listings:search:${JSON.stringify({ query, page, perPage })}`;

    return this.cacheService.getOrSet(cacheKey, 180, async () => {
      const where: any = {};
      if (query.category) where.categoryId = toPrismaId(query.category);
      if (query.country) where.country = query.country;
      if (query.minPrice) where.price = { gte: query.minPrice };
      if (query.maxPrice)
        where.price = { ...where.price, lte: query.maxPrice };

      if (query.attributes) {
        where.AND = Object.entries(query.attributes).map(([fieldKey, value]) => ({
          attributes: {
            some: {
              field: { fieldKey },
              value: typeof value === 'string' ? { equals: value } : { in: value },
            },
          },
        }));
      }

      const [listings, total] = await Promise.all([
        query.q
          ? this.listingRepository.search(query.q, skip, perPage, where)
          : this.listingRepository.findAll(skip, perPage, where),
        this.listingRepository.count(where),
      ]);

      return {
        data: listings.map((listing) => this.mapToResponseDto(listing)),
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    });
  }

  async updateListing(id: string, sellerId: string, updateListingDto: UpdateListingDto) {
    const listing = await this.listingRepository.findById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== toPrismaId(sellerId)) {
      throw new BadRequestException('You do not own this listing');
    }

    const updated = await this.listingRepository.update(id, updateListingDto);
    return this.mapToResponseDto(updated);
  }

  async deleteListing(id: string, sellerId: string) {
    const listing = await this.listingRepository.findById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== toPrismaId(sellerId)) {
      throw new BadRequestException('You do not own this listing');
    }

    await this.listingRepository.delete(id);
    return true;
  }

  async getSellerListings(sellerId: string | number | bigint, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [listings, total] = await Promise.all([
      this.listingRepository.findBySeller(sellerId, skip, perPage),
      this.listingRepository.count({ sellerId: toPrismaId(sellerId) }),
    ]);

    return {
      data: listings.map((listing) => this.mapToResponseDto(listing)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async getTopPicks(page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [listings, total] = await Promise.all([
      this.listingRepository.findAll(skip, perPage),
      this.listingRepository.count(),
    ]);

    return {
      data: listings.map((listing) => this.mapToResponseDto(listing)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  private mapToResponseDto(listing: any): ListingResponseDto {
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      category: listing.categoryId ?? listing.category,
      location: listing.location,
      country: listing.country,
      image: listing.image,
      condition: listing.condition,
      createdAt: listing.createdAt,
    };
  }
}
