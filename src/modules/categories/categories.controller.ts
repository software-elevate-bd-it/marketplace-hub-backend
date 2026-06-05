import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './service/category.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with industry grouping' })
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get(':id/schema')
  @ApiOperation({ summary: 'Get dynamic filter schema for a category' })
  getCategorySchema(@Param('id') categoryId: string) {
    return this.categoryService.getCategorySchema(categoryId);
  }
}
