import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`banquets\` ADD \`hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`banquets_hero_image_idx\` ON \`banquets\` (\`hero_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_banquets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Банкеты и VIP-зал' NOT NULL,
  	\`intro\` text,
  	\`content\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_banquets\`("id", "title", "intro", "content", "updated_at", "created_at") SELECT "id", "title", "intro", "content", "updated_at", "created_at" FROM \`banquets\`;`)
  await db.run(sql`DROP TABLE \`banquets\`;`)
  await db.run(sql`ALTER TABLE \`__new_banquets\` RENAME TO \`banquets\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
