import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`business_lunch_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_groups_items_order_idx\` ON \`business_lunch_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_groups_items_parent_id_idx\` ON \`business_lunch_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_groups_order_idx\` ON \`business_lunch_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_groups_parent_id_idx\` ON \`business_lunch_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`title\` text DEFAULT 'Бизнес-ланч' NOT NULL,
  	\`schedule\` text DEFAULT 'По будням с 12:00 до 15:00' NOT NULL,
  	\`intro\` text,
  	\`note\` text DEFAULT 'Кроме бизнес-ланча вы всегда можете заказать любое блюдо из основного меню',
  	\`image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_image_idx\` ON \`business_lunch\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`business_lunch_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch\`;`)
}
