import { Injectable, NotFoundException } from '@nestjs/common';
import { FavoriteRepository } from '../repository/favorite.repository';
import { ListingRepository } from 'src/modules/listings/repository/listing.repository';
import { FavoriteDto, FavoriteListingDto } from '../dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private listingRepository: ListingRepository,
  ) {}

  async addFavorite(userId: string, listingId: string): Promise<FavoriteDto> {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const isFavored = await this.favoriteRepository.isFavored(userId, listingId);
    if (isFavored) {
      return this.mapToDto(await this.favoriteRepository.findByUserAndListing(userId, listingId));
    }

    const favorite = await this.favoriteRepository.create({
      userId,
      listingId,
    });

    return this.mapToDto(favorite);
  }

  async removeFavorite(userId: string, listingId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findByUserAndListing(userId, listingId);
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.deleteByUserAndListing(userId, listingId);
    return true;
  }

  async getUserFavorites(userId: string, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const [favorites, total] = await Promise.all([
      this.favoriteRepository.findByUserId(userId, skip, perPage),
      this.favoriteRepository.countByUser(userId),
    ]);

    const listings = await Promise.all(
      favorites.map((fav) => this.listingRepository.findById(fav.listingId)),
    );

    return {
      data: listings.filter((l): l is any => !!l).map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        image: listing.image,
        createdAt: listing.createdAt,
      })),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async isFavored(userId: string, listingId: string): Promise<boolean> {
    return this.favoriteRepository.isFavored(userId, listingId);
  }

  private mapToDto(favorite: any): FavoriteDto {
    return {
      id: favorite.id,
      userId: favorite.userId,
      listingId: favorite.listingId,
      createdAt: favorite.createdAt,
    };
  }
}
