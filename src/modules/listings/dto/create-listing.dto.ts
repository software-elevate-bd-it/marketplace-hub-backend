import {
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  currency: string;

  @IsString()
  category: string;

  @IsString()
  location: string;

  @IsString()
  country: string;

  @IsString()
  image: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  condition: string;
}