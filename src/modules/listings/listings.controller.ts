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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ListingService } from './service/listing.service';
import { CreateListingDto, UpdateListingDto, QueryListingDto } from './dto/listing.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingService: ListingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new listing' })
  async createListing(
    @CurrentUser() user: any,
    @Body() createListingDto: CreateListingDto,
  ) {
    return this.listingService.createListing(user.id, createListingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter listings' })
  async searchListings(
    @Query() query: QueryListingDto,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.listingService.searchListings(query, pagination.page, pagination.perPage);
  }

  @Get('top-picks')
  @ApiOperation({ summary: 'Get top picks listings' })
  async getTopPicks(@Query() pagination: PaginationQueryDto) {
    return this.listingService.getTopPicks(pagination.page, pagination.perPage);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent listings' })
  async getRecentListings(@Query() pagination: PaginationQueryDto) {
    return this.listingService.getTopPicks(pagination.page, pagination.perPage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing details' })
  async getListingById(@Param('id') id: string) {
    return this.listingService.getListingById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own listing' })
  async updateListing(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.listingService.updateListing(id, user.id, updateListingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own listing' })
  async deleteListing(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingService.deleteListing(id, user.id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a listing' })
  async reportListing(@Param('id') id: string, @Body() body: any) {
    return { success: true, message: 'Listing reported' };
  }
}