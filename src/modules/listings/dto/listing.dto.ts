import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  USED = 'used',
}

export class CreateListingDto {
  @ApiProperty({ example: 'Hand-thrown stoneware bowl' })
  @IsString()
  title: string;

  @ApiProperty({ example: 64 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Ceramics' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Brooklyn, NY' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Beautiful hand-thrown stoneware' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ListingCondition, example: 'new' })
  @IsEnum(ListingCondition)
  condition: ListingCondition;

  @ApiProperty({ example: ['url1', 'url2'] })
  @IsArray()
  images: string[];

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateListingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class QueryListingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, string | string[]>;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class ListingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  condition: string;

  @ApiProperty()
  createdAt: Date;
}
