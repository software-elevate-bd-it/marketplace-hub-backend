import { ApiProperty } from '@nestjs/swagger';

export class FavoriteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  listingId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}

export class FavoriteListingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  image: string;

  @ApiProperty()
  createdAt: Date;
}
