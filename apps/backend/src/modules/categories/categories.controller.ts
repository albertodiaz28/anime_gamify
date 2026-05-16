import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Category } from '@anime-gamify/shared-types';
import { Public } from '../auth/decorators';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: 'List of categories' })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
}
