import { Module } from '@nestjs/common';
import { FavoriteRepository } from './repository/favorite.repository';
import { FavoriteService } from './service/favorite.service';
import { FavoritesController } from './favorites.controller';
import { ListingRepository } from 'src/modules/listings/repository/listing.repository';

@Module({
  providers: [FavoriteRepository, FavoriteService, ListingRepository],
  controllers: [FavoritesController],
  exports: [FavoriteService],
})
export class FavoritesModule {}
