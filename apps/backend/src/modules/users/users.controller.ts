import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@anime-gamify/shared-types';
import { CurrentUser, type AuthenticatedUser } from '../auth';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Current user profile' })
  async getMe(@CurrentUser() current: AuthenticatedUser): Promise<User> {
    const user = await this.usersService.findByIdOrFail(current.id);
    return this.usersService.toPublicUser(user);
  }

  @Patch('me/avatar')
  @ApiOkResponse({ description: 'Updated user profile' })
  async updateAvatar(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: UpdateAvatarDto,
  ): Promise<User> {
    const user = await this.usersService.updateAvatar(current.id, { ...dto });
    return this.usersService.toPublicUser(user);
  }
}
