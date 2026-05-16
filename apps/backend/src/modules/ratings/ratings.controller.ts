import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Rating, RatingAggregate } from '@anime-gamify/shared-types';
import { CurrentUser, Public, type AuthenticatedUser } from '../auth';
import { RateAnimeDto } from './dto/rate-anime.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@Controller('animes')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':id/rating')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Upserts the rating for the current user' })
  rate(
    @CurrentUser() current: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) animeId: string,
    @Body() dto: RateAnimeDto,
  ): Promise<Rating> {
    return this.ratingsService.upsertRating(current.id, animeId, dto.score);
  }

  @Public()
  @Get(':id/rating/aggregate')
  @ApiOkResponse({ description: 'Average and count for the anime' })
  aggregate(@Param('id', ParseUUIDPipe) animeId: string): Promise<RatingAggregate> {
    return this.ratingsService.getAggregate(animeId);
  }
}
