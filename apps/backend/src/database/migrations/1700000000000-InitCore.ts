import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitCore1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'username', type: 'varchar', length: '64', isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'level', type: 'int', default: 1, isNullable: false },
          { name: 'xp', type: 'int', default: 0, isNullable: false },
          {
            name: 'avatar_config',
            type: 'jsonb',
            default: `'{"baseSkin":"default"}'::jsonb`,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username")');

    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'slug', type: 'varchar', length: '64', isNullable: false },
          { name: 'name', type: 'varchar', length: '128', isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_categories_slug" ON "categories" ("slug")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_categories_slug"');
    await queryRunner.dropTable('categories', true);
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_username"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_email"');
    await queryRunner.dropTable('users', true);
  }
}
