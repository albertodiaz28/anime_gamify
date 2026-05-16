import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'node:path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'anime',
  password: process.env.DB_PASSWORD ?? 'anime',
  database: process.env.DB_NAME ?? 'anime_gamify',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
