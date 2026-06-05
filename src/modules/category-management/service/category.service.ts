import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto, CreateFieldOptionDto, ReorderFieldsDto } from '../dto/category.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  // CATEGORY MANAGEMENT
  async createCategory(dto: CreateCategoryDto): Promise<SuccessResponse> {
    try {
      const slug = dto.slug.toLowerCase().trim();
      const category = await this.categoryRepository.createCategory({
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon,
        image: dto.image,
        order: dto.order || 0,
        parentId: dto.parentId ? BigInt(dto.parentId) : null,
      });
      return new SuccessResponse('Category created', category);
    } catch (error) {
      console.error('Category creation failed:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async getAllCategories(page: number = 1, limit: number = 10): Promise<SuccessResponse> {
    try {
      const skip = (page - 1) * limit;
      const [categories, total] = await Promise.all([
        this.categoryRepository.findAllCategories(skip, limit),
        Promise.resolve(0), // Add total count if needed
      ]);
      return new SuccessResponse('Categories retrieved', { categories, total });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve categories');
    }
  }

  async getCategoryById(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      const category = await this.categoryRepository.findCategoryById(BigInt(id));
      if (!category) throw new BadRequestException('Category not found');
      return new SuccessResponse('Category retrieved', category);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve category');
    }
  }

  async updateCategory(id: string | number | bigint, dto: UpdateCategoryDto): Promise<SuccessResponse> {
    try {
      const category = await this.categoryRepository.updateCategory(BigInt(id), dto);
      return new SuccessResponse('Category updated', category);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async deleteCategory(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      await this.categoryRepository.deleteCategory(BigInt(id));
      return new SuccessResponse('Category deleted', { id });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  // CATEGORY FIELD MANAGEMENT
  async createField(categoryId: string | number | bigint, dto: CreateCategoryFieldDto): Promise<SuccessResponse> {
    try {
      const field = await this.categoryRepository.createField({
        categoryId: BigInt(categoryId),
        label: dto.label,
        fieldKey: dto.fieldKey.toLowerCase().trim(),
        fieldType: dto.fieldType,
        description: dto.description,
        required: dto.required || false,
        filterable: dto.filterable || false,
        searchable: dto.searchable || false,
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        step: dto.step,
        order: dto.order || 0,
      });
      return new SuccessResponse('Field created', field);
    } catch (error) {
      console.error('Field creation failed:', error);
      throw new InternalServerErrorException('Failed to create field');
    }
  }

  async getFieldsByCategory(categoryId: string | number | bigint): Promise<SuccessResponse> {
    try {
      const fields = await this.categoryRepository.findFieldsByCategory(BigInt(categoryId));
      return new SuccessResponse('Fields retrieved', fields);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve fields');
    }
  }

  async updateField(id: string | number | bigint, dto: any): Promise<SuccessResponse> {
    try {
      const field = await this.categoryRepository.updateField(BigInt(id), dto);
      return new SuccessResponse('Field updated', field);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update field');
    }
  }

  async deleteField(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      await this.categoryRepository.deleteField(BigInt(id));
      return new SuccessResponse('Field deleted', { id });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete field');
    }
  }

  async reorderFields(categoryId: string | number | bigint, dto: ReorderFieldsDto): Promise<SuccessResponse> {
    try {
      const fieldIds = dto.fieldIds.map((id) => BigInt(id));
      await this.categoryRepository.reorderFields(BigInt(categoryId), fieldIds);
      return new SuccessResponse('Fields reordered', {});
    } catch (error) {
      throw new InternalServerErrorException('Failed to reorder fields');
    }
  }

  // FIELD OPTIONS MANAGEMENT
  async createFieldOption(fieldId: string | number | bigint, dto: CreateFieldOptionDto): Promise<SuccessResponse> {
    try {
      const option = await this.categoryRepository.createFieldOption({
        fieldId: BigInt(fieldId),
        label: dto.label,
        value: dto.value,
        order: dto.order || 0,
      });
      return new SuccessResponse('Option created', option);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create option');
    }
  }

  async getFieldOptions(fieldId: string | number | bigint): Promise<SuccessResponse> {
    try {
      const options = await this.categoryRepository.findOptionsByField(BigInt(fieldId));
      return new SuccessResponse('Options retrieved', options);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve options');
    }
  }

  async deleteFieldOption(id: string | number | bigint): Promise<SuccessResponse> {
    try {
      await this.categoryRepository.deleteFieldOption(BigInt(id));
      return new SuccessResponse('Option deleted', { id });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete option');
    }
  }
}
