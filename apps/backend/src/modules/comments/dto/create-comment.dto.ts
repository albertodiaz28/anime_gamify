import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const MAX_BODY = 1000;

export class CreateCommentDto {
  @ApiProperty({ maxLength: MAX_BODY })
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_BODY)
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
