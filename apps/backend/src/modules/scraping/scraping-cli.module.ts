import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../config/typeorm.config';
import { ScrapeCommand } from './commands/scrape.command';
import { ScrapingModule } from './scraping.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    ScrapingModule,
  ],
  providers: [ScrapeCommand],
})
export class ScrapingCliModule {}
