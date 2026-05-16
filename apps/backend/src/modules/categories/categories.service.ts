import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Category } from '@anime-gamify/shared-types';
import { CATEGORIES_SEED } from '@anime-gamify/shared-constants';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.repo.find({ order: { name: 'ASC' } });
    return rows.map((row) => ({ id: row.id, slug: row.slug, name: row.name }));
  }

  private async seed(): Promise<void> {
    const existing = await this.repo.find();
    const existingSlugs = new Set(existing.map((c) => c.slug));
    const missing = CATEGORIES_SEED.filter((c) => !existingSlugs.has(c.slug));
    if (missing.length === 0) {
      return;
    }
    const entities = missing.map((c) => this.repo.create({ slug: c.slug, name: c.name }));
    await this.repo.save(entities);
  }
}
