import {
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  listingId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}