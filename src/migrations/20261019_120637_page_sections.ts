import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_text_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`image_position\` text DEFAULT 'right',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_image_order_idx\` ON \`pages_blocks_text_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_image_parent_id_idx\` ON \`pages_blocks_text_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_image_path_idx\` ON \`pages_blocks_text_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_image_image_idx\` ON \`pages_blocks_text_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_highlight_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_highlight\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_highlight_stats_order_idx\` ON \`pages_blocks_highlight_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_highlight_stats_parent_id_idx\` ON \`pages_blocks_highlight_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_highlight\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`content\` text,
  	\`link_url\` text,
  	\`link_label\` text DEFAULT 'Подробнее',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_highlight_order_idx\` ON \`pages_blocks_highlight\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_highlight_parent_id_idx\` ON \`pages_blocks_highlight\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_highlight_path_idx\` ON \`pages_blocks_highlight\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_media_id_idx\` ON \`pages_rels\` (\`media_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_text_image\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_highlight_stats\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_highlight\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
}
