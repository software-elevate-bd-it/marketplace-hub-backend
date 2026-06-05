import { Module } from '@nestjs/common';
import { CartRepository } from './repository/cart.repository';
import { CartService } from './service/cart.service';
import { CartController } from './cart.controller';
import { ListingRepository } from 'src/modules/listings/repository/listing.repository';

@Module({
  providers: [CartRepository, CartService, ListingRepository],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
