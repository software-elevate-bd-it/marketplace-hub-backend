import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from '../repository/cart.repository';
import { ListingRepository } from 'src/modules/listings/repository/listing.repository';
import { AddToCartDto, UpdateCartItemDto, CartItemDto, CartResponseDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private listingRepository: ListingRepository,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return {
        items: [],
        subtotal: 0,
        currency: 'USD',
        updatedAt: new Date(),
      };
    }

    const items = Array.isArray(cart.items) ? (cart.items as unknown as CartItemDto[]) : [];
    const subtotal = items.reduce((sum: number, item: CartItemDto) => sum + item.price * item.qty, 0);

    return {
      items,
      subtotal,
      currency: 'USD',
      updatedAt: cart.updatedAt,
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const listing = await this.listingRepository.findById(addToCartDto.listingId);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const cartItem = {
      listingId: addToCartDto.listingId,
      qty: addToCartDto.qty,
      price: listing.price,
      title: listing.title,
      image: listing.image,
    };

    const cart = await this.cartRepository.addItem(userId, cartItem);
    return this.mapToResponseDto(cart);
  }

  async updateCartItem(userId: string, listingId: string, updateCartItemDto: UpdateCartItemDto) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const updated = await this.cartRepository.updateItem(userId, listingId, updateCartItemDto.qty);
    return this.mapToResponseDto(updated);
  }

  async removeFromCart(userId: string, listingId: string) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.removeItem(userId, listingId);
    return true;
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.clearCart(userId);
    return true;
  }

  private mapToResponseDto(cart: any): CartResponseDto {
    const items = Array.isArray(cart.items) ? (cart.items as unknown as CartItemDto[]) : [];
    const subtotal = items.reduce((sum: number, item: CartItemDto) => sum + item.price * item.qty, 0);

    return {
      items,
      subtotal,
      currency: 'USD',
      updatedAt: cart.updatedAt || new Date(),
    };
  }
}
