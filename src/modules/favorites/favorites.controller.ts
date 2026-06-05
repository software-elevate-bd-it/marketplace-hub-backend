import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FavoriteService } from './service/favorite.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private favoriteService: FavoriteService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List favorites of current user' })
  async getUserFavorites(
    @CurrentUser() user: any,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.favoriteService.getUserFavorites(user.id, pagination.page, pagination.perPage);
  }

  @Post(':listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add to favorites' })
  async addFavorite(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    await this.favoriteService.addFavorite(user.id, listingId);
    return { success: true, message: 'Added to favorites' };
  }

  @Delete(':listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove from favorites' })
  async removeFavorite(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    await this.favoriteService.removeFavorite(user.id, listingId);
    return { success: true, message: 'Removed from favorites' };
  }
}
