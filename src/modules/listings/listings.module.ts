import { Module } from '@nestjs/common';
import { ListingRepository } from './repository/listing.repository';
import { ListingService } from './service/listing.service';
import { ListingsController } from './listings.controller';

@Module({
  providers: [ListingRepository, ListingService],
  controllers: [ListingsController],
  exports: [ListingService, ListingRepository],
})
export class ListingsModule {}