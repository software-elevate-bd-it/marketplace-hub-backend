import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './service/category.service';
import { CategoryRepository } from './repository/category.repository';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryManagementModule {}
