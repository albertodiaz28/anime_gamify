import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
})
export class AppModule {}
