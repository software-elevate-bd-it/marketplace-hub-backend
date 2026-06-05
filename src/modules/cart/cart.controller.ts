import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CartService } from './service/cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current cart' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    await this.cartService.addToCart(user.id, addToCartDto);
    return { success: true, message: 'Item added to cart' };
  }

  @Patch('items/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update item quantity' })
  async updateCartItem(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    await this.cartService.updateCartItem(user.id, listingId, updateCartItemDto);
    return { success: true, message: 'Cart item updated' };
  }

  @Delete('items/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    await this.cartService.removeFromCart(user.id, listingId);
    return { success: true, message: 'Item removed from cart' };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: any) {
    await this.cartService.clearCart(user.id);
    return { success: true, message: 'Cart cleared' };
  }
}
