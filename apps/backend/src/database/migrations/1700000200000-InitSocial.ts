import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSocial1700000200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "skill_type_enum" AS ENUM ('COSMETIC', 'FEATURE')
    `);

    await queryRunner.query(`
      CREATE TABLE "ratings" (
        "user_id" uuid NOT NULL,
        "anime_id" uuid NOT NULL,
        "score" int NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ratings" PRIMARY KEY ("user_id", "anime_id"),
        CONSTRAINT "CHK_ratings_score" CHECK ("score" >= 1 AND "score" <= 10),
        CONSTRAINT "FK_ratings_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ratings_anime" FOREIGN KEY ("anime_id")
          REFERENCES "animes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_ratings_anime" ON "ratings" ("anime_id")');

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "anime_id" uuid NOT NULL,
        "parent_id" uuid,
        "body" varchar(1000) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comments_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_anime" FOREIGN KEY ("anime_id")
          REFERENCES "animes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_parent" FOREIGN KEY ("parent_id")
          REFERENCES "comments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_comments_anime_created" ON "comments" ("anime_id", "created_at" DESC, "id" DESC)',
    );
    await queryRunner.query('CREATE INDEX "IDX_comments_user" ON "comments" ("user_id")');
    await queryRunner.query('CREATE INDEX "IDX_comments_parent" ON "comments" ("parent_id")');

    await queryRunner.query(`
      CREATE TABLE "watched_episodes" (
        "user_id" uuid NOT NULL,
        "episode_id" uuid NOT NULL,
        "watched_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_watched_episodes" PRIMARY KEY ("user_id", "episode_id"),
        CONSTRAINT "FK_watched_episodes_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_watched_episodes_episode" FOREIGN KEY ("episode_id")
          REFERENCES "episodes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_watched_episodes_user" ON "watched_episodes" ("user_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar(64) NOT NULL,
        "name" varchar(128) NOT NULL,
        "description" varchar(500) NOT NULL,
        "required_level" int NOT NULL,
        "type" "skill_type_enum" NOT NULL,
        "payload" jsonb NOT NULL DEFAULT '{}'::jsonb
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_skills_slug" ON "skills" ("slug")');
    await queryRunner.query(
      'CREATE INDEX "IDX_skills_required_level" ON "skills" ("required_level")',
    );

    await queryRunner.query(`
      CREATE TABLE "user_skills" (
        "user_id" uuid NOT NULL,
        "skill_id" uuid NOT NULL,
        "unlocked_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_skills" PRIMARY KEY ("user_id", "skill_id"),
        CONSTRAINT "FK_user_skills_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_skills_skill" FOREIGN KEY ("skill_id")
          REFERENCES "skills"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_user_skills_user" ON "user_skills" ("user_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "user_skills"');
    await queryRunner.query('DROP TABLE IF EXISTS "skills"');
    await queryRunner.query('DROP TABLE IF EXISTS "watched_episodes"');
    await queryRunner.query('DROP TABLE IF EXISTS "comments"');
    await queryRunner.query('DROP TABLE IF EXISTS "ratings"');
    await queryRunner.query('DROP TYPE IF EXISTS "skill_type_enum"');
  }
}
