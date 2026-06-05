import { Module } from '@nestjs/common';
import { CategoryService } from './service/category.service';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [CategoryService],
  controllers: [CategoriesController],
  exports: [CategoryService],
})
export class CategoriesModule {}
