import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

const MIN_SCORE = 1;
const MAX_SCORE = 10;

export class RateAnimeDto {
  @ApiProperty({ minimum: MIN_SCORE, maximum: MAX_SCORE })
  @IsInt()
  @Min(MIN_SCORE)
  @Max(MAX_SCORE)
  score!: number;
}
