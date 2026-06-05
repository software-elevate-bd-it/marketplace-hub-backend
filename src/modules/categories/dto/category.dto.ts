import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  industry: string;

  @ApiPropertyOptional()
  children?: CategoryDto[];
}

export class CategorySchemaDto {
  @ApiProperty()
  fields: Array<{
    key: string;
    label: string;
    type: 'select' | 'range' | 'text' | 'checkbox';
    options?: string[];
    min?: number;
    max?: number;
  }>;
}
