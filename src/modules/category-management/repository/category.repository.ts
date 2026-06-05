import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  // CATEGORY OPERATIONS
  async createCategory(data: any) {
    return this.prisma.category.create({ data });
  }

  async findCategoryById(id: bigint) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, fields: true },
    });
  }

  async findAllCategories(skip: number = 0, take: number = 10) {
    return this.prisma.category.findMany({
      skip,
      take,
      include: { parent: true, children: true },
      orderBy: { order: 'asc' },
    });
  }

  async updateCategory(id: bigint, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
      include: { fields: true, children: true },
    });
  }

  async deleteCategory(id: bigint) {
    return this.prisma.category.delete({ where: { id } });
  }

  // FIELD OPERATIONS
  async createField(data: any) {
    return this.prisma.categoryField.create({ data });
  }

  async findFieldById(id: bigint) {
    return this.prisma.categoryField.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  async findFieldsByCategory(categoryId: bigint, skip: number = 0, take: number = 100) {
    return this.prisma.categoryField.findMany({
      where: { categoryId },
      include: { options: true },
      orderBy: { order: 'asc' },
      skip,
      take,
    });
  }

  async updateField(id: bigint, data: any) {
    return this.prisma.categoryField.update({
      where: { id },
      data,
      include: { options: true },
    });
  }

  async deleteField(id: bigint) {
    return this.prisma.categoryField.delete({ where: { id } });
  }

  async reorderFields(categoryId: bigint, fieldIds: bigint[]) {
    const updates = fieldIds.map((fieldId, index) =>
      this.prisma.categoryField.update({
        where: { id: fieldId },
        data: { order: index },
      }),
    );
    return Promise.all(updates);
  }

  // FIELD OPTIONS OPERATIONS
  async createFieldOption(data: any) {
    return this.prisma.categoryFieldOption.create({ data });
  }

  async findOptionsByField(fieldId: bigint) {
    return this.prisma.categoryFieldOption.findMany({
      where: { fieldId },
      orderBy: { order: 'asc' },
    });
  }

  async updateFieldOption(id: bigint, data: any) {
    return this.prisma.categoryFieldOption.update({
      where: { id },
      data,
    });
  }

  async deleteFieldOption(id: bigint) {
    return this.prisma.categoryFieldOption.delete({ where: { id } });
  }

  async deleteFieldOptions(fieldId: bigint) {
    return this.prisma.categoryFieldOption.deleteMany({
      where: { fieldId },
    });
  }
}
