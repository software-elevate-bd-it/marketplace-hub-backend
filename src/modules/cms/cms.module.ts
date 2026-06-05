// CMS MODULE
import { Module } from '@nestjs/common';
import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

// DTO
export class CreateCMSPageDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateCMSPageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

// Repository
@Injectable()
export class CMSRepository {
  constructor(private prisma: PrismaService) {}

  async createPage(data: any) {
    return this.prisma.cMSPage.create({ data });
  }

  async findPageBySlug(slug: string) {
    return this.prisma.cMSPage.findUnique({ where: { slug } });
  }

  async findAllPages() {
    return this.prisma.cMSPage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updatePage(id: bigint, data: any) {
    return this.prisma.cMSPage.update({ where: { id }, data });
  }

  async deletePage(id: bigint) {
    return this.prisma.cMSPage.delete({ where: { id } });
  }
}

// Service
@Injectable()
export class CMSService {
  constructor(private cmsRepository: CMSRepository) {}

  async createPage(dto: CreateCMSPageDto): Promise<SuccessResponse> {
    const page = await this.cmsRepository.createPage(dto);
    return new SuccessResponse('Page created', page);
  }

  async getPageBySlug(slug: string): Promise<SuccessResponse> {
    const page = await this.cmsRepository.findPageBySlug(slug);
    return new SuccessResponse('Page retrieved', page);
  }

  async getAllPages(): Promise<SuccessResponse> {
    const pages = await this.cmsRepository.findAllPages();
    return new SuccessResponse('Pages retrieved', pages);
  }

  async updatePage(id: string | number | bigint, dto: UpdateCMSPageDto): Promise<SuccessResponse> {
    const page = await this.cmsRepository.updatePage(BigInt(id), dto);
    return new SuccessResponse('Page updated', page);
  }

  async deletePage(id: string | number | bigint): Promise<SuccessResponse> {
    await this.cmsRepository.deletePage(BigInt(id));
    return new SuccessResponse('Page deleted', { id });
  }
}

// Controller
@ApiTags('CMS')
@Controller('cms')
export class CMSController {
  constructor(private cmsService: CMSService) {}

  @Get()
  @ApiOperation({ summary: 'Get all CMS pages' })
  async getAllPages() {
    return this.cmsService.getAllPages();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get page by slug' })
  async getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create CMS page (admin)' })
  async createPage(@Body() dto: CreateCMSPageDto) {
    return this.cmsService.createPage(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update CMS page' })
  async updatePage(@Param('id') id: string, @Body() dto: UpdateCMSPageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete CMS page' })
  async deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }
}

@Module({
  controllers: [CMSController],
  providers: [CMSService, CMSRepository],
  exports: [CMSService],
})
export class CMSModule {}
