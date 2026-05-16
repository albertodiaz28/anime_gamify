import { ApiProperty } from '@nestjs/swagger';
import { AnimeCard, AnimeStatus, Category } from '@anime-gamify/shared-types';

export class AnimeCardDto implements AnimeCard {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  coverUrl!: string;

  @ApiProperty()
  totalEpisodes!: number;

  @ApiProperty({ enum: AnimeStatus })
  status!: AnimeStatus;

  @ApiProperty()
  avgRating!: number;

  @ApiProperty()
  ratingCount!: number;

  @ApiProperty({ type: 'array' })
  categories!: Pick<Category, 'id' | 'slug' | 'name'>[];
}
