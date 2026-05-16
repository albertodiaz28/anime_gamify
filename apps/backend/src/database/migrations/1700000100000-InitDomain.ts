import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDomain1700000100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

    await queryRunner.query(`
      CREATE TYPE "anime_status_enum" AS ENUM ('AIRING', 'FINISHED', 'UPCOMING')
    `);
    await queryRunner.query(`
      CREATE TYPE "server_language_enum" AS ENUM ('ES', 'LAT', 'JP_SUB', 'EN_SUB', 'EN_DUB')
    `);

    await queryRunner.query(`
      CREATE TABLE "animes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" varchar(128) NOT NULL,
        "slug" varchar(160) NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "cover_url" varchar(500) NOT NULL,
        "total_episodes" int NOT NULL DEFAULT 0,
        "seasons" int NOT NULL DEFAULT 1,
        "status" "anime_status_enum" NOT NULL DEFAULT 'AIRING',
        "avg_rating" numeric(4,2) NOT NULL DEFAULT 0,
        "rating_count" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_animes_external_id" ON "animes" ("external_id")',
    );
    await queryRunner.query('CREATE INDEX "IDX_animes_slug" ON "animes" ("slug")');
    await queryRunner.query(
      'CREATE INDEX "IDX_animes_total_episodes" ON "animes" ("total_episodes")',
    );
    await queryRunner.query('CREATE INDEX "IDX_animes_avg_rating" ON "animes" ("avg_rating")');
    await queryRunner.query(
      'CREATE INDEX "IDX_animes_title_trgm" ON "animes" USING GIN ("title" gin_trgm_ops)',
    );

    await queryRunner.query(`
      CREATE TABLE "episodes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "anime_id" uuid NOT NULL,
        "number" int NOT NULL,
        "title" varchar(255) NOT NULL,
        CONSTRAINT "UQ_episodes_anime_number" UNIQUE ("anime_id", "number"),
        CONSTRAINT "FK_episodes_anime" FOREIGN KEY ("anime_id")
          REFERENCES "animes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_episodes_anime_id" ON "episodes" ("anime_id")');

    await queryRunner.query(`
      CREATE TABLE "servers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "episode_id" uuid NOT NULL,
        "name" varchar(64) NOT NULL,
        "embed_url" varchar(500) NOT NULL,
        "language" "server_language_enum" NOT NULL,
        CONSTRAINT "FK_servers_episode" FOREIGN KEY ("episode_id")
          REFERENCES "episodes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_servers_episode_language" ON "servers" ("episode_id", "language")',
    );

    await queryRunner.query(`
      CREATE TABLE "anime_categories" (
        "anime_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        PRIMARY KEY ("anime_id", "category_id"),
        CONSTRAINT "FK_anime_categories_anime" FOREIGN KEY ("anime_id")
          REFERENCES "animes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_anime_categories_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_anime_categories_anime" ON "anime_categories" ("anime_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_anime_categories_category" ON "anime_categories" ("category_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "anime_categories"');
    await queryRunner.query('DROP TABLE IF EXISTS "servers"');
    await queryRunner.query('DROP TABLE IF EXISTS "episodes"');
    await queryRunner.query('DROP TABLE IF EXISTS "animes"');
    await queryRunner.query('DROP TYPE IF EXISTS "server_language_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "anime_status_enum"');
  }
}
