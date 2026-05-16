import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Comment, CursorPage } from '@anime-gamify/shared-types';
import { CurrentUser, Public } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/types';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('animes/:id/comments')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Creates a comment for the anime' })
  create(
    @CurrentUser() current: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) animeId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.create(current.id, animeId, dto.body, dto.parentId);
  }

  @Public()
  @Get('animes/:id/comments')
  @ApiOkResponse({ description: 'Paginated comments for the anime' })
  list(
    @Param('id', ParseUUIDPipe) animeId: string,
    @Query() query: ListCommentsQueryDto,
  ): Promise<CursorPage<Comment>> {
    return this.commentsService.list(animeId, query.cursor, query.limit);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOkResponse({ description: 'Deletes the comment if the caller is the author' })
  remove(
    @CurrentUser() current: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.commentsService.remove(current.id, id);
  }
}
