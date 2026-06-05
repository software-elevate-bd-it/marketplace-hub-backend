import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsString()
  listingId: string;

  @ApiProperty()
  @IsNumber()
  qty: number;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsNumber()
  qty: number;
}

export class CartItemDto {
  @ApiProperty()
  listingId: string;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  image?: string;
}

export class CartResponseDto {
  @ApiProperty()
  items: CartItemDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  updatedAt: Date;
}
