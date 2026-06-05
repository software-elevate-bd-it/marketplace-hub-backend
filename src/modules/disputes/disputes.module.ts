// DISPUTES MODULE
import { Module } from '@nestjs/common';
import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

// DTO
export enum DisputeStatusEnum {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  evidence?: string[];
}

export class ResolveDisputeDto {
  @ApiProperty()
  @IsString()
  resolution: string;
}

// Repository
@Injectable()
export class DisputeRepository {
  constructor(private prisma: PrismaService) {}

  async createDispute(data: any) {
    return this.prisma.dispute.create({ data });
  }

  async findDisputeById(id: bigint) {
    return this.prisma.dispute.findUnique({
      where: { id },
      include: { order: true, buyer: true, seller: true },
    });
  }

  async findAllDisputes(skip: number = 0, take: number = 20) {
    return this.prisma.dispute.findMany({
      skip,
      take,
      include: { order: true, buyer: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDisputeByOrder(orderId: bigint) {
    return this.prisma.dispute.findUnique({
      where: { orderId },
    });
  }

  async updateDispute(id: bigint, data: any) {
    return this.prisma.dispute.update({
      where: { id },
      data,
    });
  }
}

// Service
@Injectable()
export class DisputeService {
  constructor(private disputeRepository: DisputeRepository) {}

  async createDispute(orderId: string | number | bigint, buyerId: string | number | bigint, sellerId: string | number | bigint, dto: CreateDisputeDto): Promise<SuccessResponse> {
    const dispute = await this.disputeRepository.createDispute({
      orderId: BigInt(orderId),
      buyerId: BigInt(buyerId),
      sellerId: BigInt(sellerId),
      reason: dto.reason,
      detail: dto.detail,
      evidence: dto.evidence,
      status: DisputeStatusEnum.OPEN,
    });
    return new SuccessResponse('Dispute created', dispute);
  }

  async getAllDisputes(page: number = 1, limit: number = 20): Promise<SuccessResponse> {
    const skip = (page - 1) * limit;
    const disputes = await this.disputeRepository.findAllDisputes(skip, limit);
    return new SuccessResponse('Disputes retrieved', disputes);
  }

  async resolveDispute(id: string | number | bigint, dto: ResolveDisputeDto): Promise<SuccessResponse> {
    const dispute = await this.disputeRepository.updateDispute(BigInt(id), {
      status: DisputeStatusEnum.RESOLVED,
      resolution: dto.resolution,
      resolvedAt: new Date(),
    });
    return new SuccessResponse('Dispute resolved', dispute);
  }
}

// Controller
@ApiTags('Disputes')
@Controller('disputes')
export class DisputeController {
  constructor(private disputeService: DisputeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create dispute' })
  async createDispute(
    @Body() dto: CreateDisputeDto,
    @CurrentUser() user: any,
  ) {
    // orderId and sellerId would come from context
    return this.disputeService.createDispute(0, user.id, 0, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all disputes (admin)' })
  async getAllDisputes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.disputeService.getAllDisputes(page, limit);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve dispute' })
  async resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolveDispute(id, dto);
  }
}

@Module({
  controllers: [DisputeController],
  providers: [DisputeService, DisputeRepository],
  exports: [DisputeService],
})
export class DisputesModule {}
