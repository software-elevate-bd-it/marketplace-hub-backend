// MODERATION MODULE
import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

// DTO
export class ApproveListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectListingDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// Repository
@Injectable()
export class ModerationRepository {
  constructor(private prisma: PrismaService) {}

  async getPendingListings(skip: number = 0, take: number = 20) {
    return this.prisma.listing.findMany({
      where: { approvalStatus: 'pending' },
      skip,
      take,
      include: { seller: true, category: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveListing(listingId: bigint) {
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { approvalStatus: 'approved', approvedAt: new Date() },
    });
  }

  async rejectListing(listingId: bigint, reason: string) {
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { approvalStatus: 'rejected', rejectionReason: reason },
    });
  }

  async deleteListing(listingId: bigint) {
    return this.prisma.listing.delete({ where: { id: listingId } });
  }
}

// Service
@Injectable()
export class ModerationService {
  constructor(private moderationRepository: ModerationRepository) {}

  async getPendingListings(page: number = 1, limit: number = 20): Promise<SuccessResponse> {
    const skip = (page - 1) * limit;
    const listings = await this.moderationRepository.getPendingListings(skip, limit);
    return new SuccessResponse('Pending listings retrieved', listings);
  }

  async approveListing(listingId: string | number | bigint): Promise<SuccessResponse> {
    const listing = await this.moderationRepository.approveListing(BigInt(listingId));
    return new SuccessResponse('Listing approved', listing);
  }

  async rejectListing(listingId: string | number | bigint, dto: RejectListingDto): Promise<SuccessResponse> {
    const listing = await this.moderationRepository.rejectListing(BigInt(listingId), dto.reason);
    return new SuccessResponse('Listing rejected', listing);
  }

  async deleteListing(listingId: string | number | bigint): Promise<SuccessResponse> {
    await this.moderationRepository.deleteListing(BigInt(listingId));
    return new SuccessResponse('Listing deleted', { id: listingId });
  }
}

// Controller
@ApiTags('Admin - Moderation')
@Controller('admin/moderation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('listings/pending')
  @ApiOperation({ summary: 'Get pending listings' })
  async getPendingListings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.moderationService.getPendingListings(page, limit);
  }

  @Post('listings/:id/approve')
  @ApiOperation({ summary: 'Approve listing' })
  async approveListing(@Param('id') id: string) {
    return this.moderationService.approveListing(id);
  }

  @Post('listings/:id/reject')
  @ApiOperation({ summary: 'Reject listing' })
  async rejectListing(@Param('id') id: string, @Body() dto: RejectListingDto) {
    return this.moderationService.rejectListing(id, dto);
  }

  @Delete('listings/:id')
  @ApiOperation({ summary: 'Delete listing' })
  async deleteListing(@Param('id') id: string) {
    return this.moderationService.deleteListing(id);
  }
}

@Module({
  controllers: [ModerationController],
  providers: [ModerationService, ModerationRepository],
  exports: [ModerationService],
})
export class ModerationModule {}
