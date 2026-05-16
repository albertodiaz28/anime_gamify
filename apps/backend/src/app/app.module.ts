import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { typeOrmConfig } from '../config/typeorm.config';
import { AnimesModule } from '../modules/animes/animes.module';
import { AuthModule } from '../modules/auth/auth.module';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { CategoriesModule } from '../modules/categories/categories.module';
import { EpisodesModule } from '../modules/episodes/episodes.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    AnimesModule,
    EpisodesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
