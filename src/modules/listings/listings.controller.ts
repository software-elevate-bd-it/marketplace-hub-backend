import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ListingsService } from './listings.service';

import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create listing',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,

    @Body()
    dto: CreateListingDto,
  ) {
    return this.listingsService.create(
      userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all listings',
  })
  findAll(
    @Query()
    query: QueryListingDto,
  ) {
    return this.listingsService.findAll(
      query,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get listing details',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.listingsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update listing',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id')
    id: string,

    @CurrentUser('id')
    userId: string,

    @Body()
    dto: UpdateListingDto,
  ) {
    return this.listingsService.update(
      id,
      userId,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete listing',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id')
    id: string,

    @CurrentUser('id')
    userId: string,
  ) {
    return this.listingsService.remove(
      id,
      userId,
    );
  }
}