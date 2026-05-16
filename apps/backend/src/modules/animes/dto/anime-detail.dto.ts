import { ApiProperty } from '@nestjs/swagger';
import {
  AnimeDetail,
  AnimeStatus,
  Category,
  Episode,
} from '@anime-gamify/shared-types';

export class AnimeDetailDto implements AnimeDetail {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  coverUrl!: string;

  @ApiProperty()
  totalEpisodes!: number;

  @ApiProperty()
  seasons!: number;

  @ApiProperty({ enum: AnimeStatus })
  status!: AnimeStatus;

  @ApiProperty()
  avgRating!: number;

  @ApiProperty()
  ratingCount!: number;

  @ApiProperty({ type: 'array' })
  categories!: Category[];

  @ApiProperty({ type: 'array' })
  episodes!: Episode[];
}
