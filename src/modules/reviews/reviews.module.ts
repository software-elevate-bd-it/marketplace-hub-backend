// REVIEWS MODULE
import { Module } from '@nestjs/common';
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

// DTO
export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

// Repository
@Injectable()
export class ReviewRepository {
  constructor(private prisma: PrismaService) {}

  async createReview(data: any) {
    return this.prisma.review.create({ data });
  }

  async findReviewsByOrder(orderId: bigint) {
    return this.prisma.review.findMany({
      where: { orderId },
    });
  }

  async findReviewsBySeller(sellerId: bigint, skip: number = 0, take: number = 20) {
    return this.prisma.review.findMany({
      where: { sellerId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSellerRating(sellerId: bigint) {
    const reviews = await this.prisma.review.findMany({
      where: { sellerId },
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
    return { avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length };
  }
}

// Service
@Injectable()
export class ReviewService {
  constructor(private reviewRepository: ReviewRepository) {}

  async createReview(orderId: string | number | bigint, reviewerId: string | number | bigint, sellerId: string | number | bigint, dto: CreateReviewDto): Promise<SuccessResponse> {
    const review = await this.reviewRepository.createReview({
      orderId: BigInt(orderId),
      reviewerId: BigInt(reviewerId),
      sellerId: BigInt(sellerId),
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });
    return new SuccessResponse('Review created', review);
  }

  async getSellerReviews(sellerId: string | number | bigint): Promise<SuccessResponse> {
    const reviews = await this.reviewRepository.findReviewsBySeller(BigInt(sellerId));
    const rating = await this.reviewRepository.getSellerRating(BigInt(sellerId));
    return new SuccessResponse('Reviews retrieved', { reviews, rating });
  }
}

// Controller
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review' })
  async createReview(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    // Fetch order to get sellerId
    return this.reviewService.createReview(orderId, user.id, 0, dto); // sellerId would come from order
  }

  @Get('sellers/:sellerId')
  @ApiOperation({ summary: 'Get seller reviews' })
  async getSellerReviews(@Param('sellerId') sellerId: string) {
    return this.reviewService.getSellerReviews(sellerId);
  }
}

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewsModule {}
