import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './service/category.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryFieldDto, CreateFieldOptionDto, ReorderFieldsDto } from './dto/category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Category CRUD
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.categoryService.getAllCategories(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category details' })
  async getById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  async delete(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  // Category Fields CRUD
  @Post(':categoryId/fields')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create field' })
  async createField(@Param('categoryId') categoryId: string, @Body() dto: CreateCategoryFieldDto) {
    return this.categoryService.createField(categoryId, dto);
  }

  @Get(':categoryId/fields')
  @ApiOperation({ summary: 'Get category fields' })
  async getFields(@Param('categoryId') categoryId: string) {
    return this.categoryService.getFieldsByCategory(categoryId);
  }

  @Patch('fields/:id')
  @ApiOperation({ summary: 'Update field' })
  async updateField(@Param('id') id: string, @Body() dto: any) {
    return this.categoryService.updateField(id, dto);
  }

  @Delete('fields/:id')
  @ApiOperation({ summary: 'Delete field' })
  async deleteField(@Param('id') id: string) {
    return this.categoryService.deleteField(id);
  }

  @Post(':categoryId/reorder-fields')
  @ApiOperation({ summary: 'Reorder fields' })
  async reorderFields(@Param('categoryId') categoryId: string, @Body() dto: ReorderFieldsDto) {
    return this.categoryService.reorderFields(categoryId, dto);
  }

  // Field Options CRUD
  @Post('fields/:fieldId/options')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create field option' })
  async createOption(@Param('fieldId') fieldId: string, @Body() dto: CreateFieldOptionDto) {
    return this.categoryService.createFieldOption(fieldId, dto);
  }

  @Get('fields/:fieldId/options')
  @ApiOperation({ summary: 'Get field options' })
  async getOptions(@Param('fieldId') fieldId: string) {
    return this.categoryService.getFieldOptions(fieldId);
  }

  @Delete('options/:id')
  @ApiOperation({ summary: 'Delete field option' })
  async deleteOption(@Param('id') id: string) {
    return this.categoryService.deleteFieldOption(id);
  }
}
