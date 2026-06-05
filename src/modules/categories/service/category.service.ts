import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getAllCategories() {
    return this.cacheService.getOrSet('categories:all', 3600, async () => {
      const categories = await this.prisma.category.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          children: true,
        },
      });

      return {
        data: categories,
        industries: ['automotive', 'electronics', 'real-estate', 'arts'],
      };
    });
  }

  async getCategorySchema(categoryId: string) {
    const cacheKey = `categories:${categoryId}:schema`;
    return this.cacheService.getOrSet(cacheKey, 3600, async () => {
      const fields = await this.prisma.categoryField.findMany({
        where: { categoryId: BigInt(categoryId) },
        orderBy: { order: 'asc' },
        include: { options: true },
      });

      return {
        fields: fields.map((field) => ({
          id: field.id,
          label: field.label,
          key: field.fieldKey,
          type: field.fieldType,
          description: field.description,
          required: field.required,
          filterable: field.filterable,
          searchable: field.searchable,
          minValue: field.minValue,
          maxValue: field.maxValue,
          step: field.step,
          minLength: field.minLength,
          maxLength: field.maxLength,
          options: field.options.map((option) => ({
            id: option.id,
            label: option.label,
            value: option.value,
          })),
        })),
      };
    });
  }
}
