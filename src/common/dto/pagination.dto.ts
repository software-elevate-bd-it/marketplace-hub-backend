import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ default: 1, description: 'Page number' })
  page: number = 1;

  @ApiProperty({ default: 20, description: 'Items per page' })
  perPage: number = 20;

  @ApiProperty({ required: false, description: 'Sort field and order (e.g., createdAt:desc)' })
  sort?: string;

  static validate(dto: PaginationDto) {
    if (dto.page < 1) dto.page = 1;
    if (dto.perPage < 1) dto.perPage = 1;
    if (dto.perPage > 100) dto.perPage = 100;
  }
}

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  perpage: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  constructor(page: number, perPage: number, total: number) {
    this.page = page;
    this.perpage = perPage;
    this.total = total;
    this.totalPages = Math.ceil(total / perPage);
  }
}

export class PaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  pagination: PaginationMeta;

  constructor(data: T[], page: number, perPage: number, total: number) {
    this.data = data;
    this.pagination = new PaginationMeta(page, perPage, total);
  }
}
