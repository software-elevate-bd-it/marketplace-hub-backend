import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 20, description: 'Number of items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  perPage: number = 20;

  @ApiPropertyOptional({ description: 'Sorting order (e.g., name:asc, createdAt:desc)' })
  @IsString()
  @IsOptional()
  sort?: string;
}
