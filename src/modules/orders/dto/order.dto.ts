import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class DisputeOrderDto {
  @ApiProperty({ example: 'Product not as described' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: ['image_url1', 'image_url2'] })
  @IsArray()
  @IsOptional()
  evidence?: string[];
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  buyerId: string;

  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  listingId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  createdAt: Date;
}

export class OrderDetailDto extends OrderResponseDto {
  @ApiProperty()
  listingTitle: string;

  @ApiProperty()
  listingImage: string;

  @ApiProperty()
  sellerName: string;

  @ApiPropertyOptional()
  escrow?: {
    stage: string;
    history: Array<{ stage: string; at: Date }>;
  };
}
