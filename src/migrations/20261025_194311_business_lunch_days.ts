import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`business_lunch_mon_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_mon_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_mon_groups_items_order_idx\` ON \`business_lunch_mon_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_mon_groups_items_parent_id_idx\` ON \`business_lunch_mon_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_mon_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_mon_groups_order_idx\` ON \`business_lunch_mon_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_mon_groups_parent_id_idx\` ON \`business_lunch_mon_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_tue_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_tue_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_tue_groups_items_order_idx\` ON \`business_lunch_tue_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_tue_groups_items_parent_id_idx\` ON \`business_lunch_tue_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_tue_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_tue_groups_order_idx\` ON \`business_lunch_tue_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_tue_groups_parent_id_idx\` ON \`business_lunch_tue_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_wed_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_wed_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_wed_groups_items_order_idx\` ON \`business_lunch_wed_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_wed_groups_items_parent_id_idx\` ON \`business_lunch_wed_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_wed_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_wed_groups_order_idx\` ON \`business_lunch_wed_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_wed_groups_parent_id_idx\` ON \`business_lunch_wed_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_thu_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_thu_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_thu_groups_items_order_idx\` ON \`business_lunch_thu_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_thu_groups_items_parent_id_idx\` ON \`business_lunch_thu_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_thu_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_thu_groups_order_idx\` ON \`business_lunch_thu_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_thu_groups_parent_id_idx\` ON \`business_lunch_thu_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_fri_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_fri_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_fri_groups_items_order_idx\` ON \`business_lunch_fri_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_fri_groups_items_parent_id_idx\` ON \`business_lunch_fri_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_fri_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_fri_groups_order_idx\` ON \`business_lunch_fri_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_fri_groups_parent_id_idx\` ON \`business_lunch_fri_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_sat_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_sat_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_sat_groups_items_order_idx\` ON \`business_lunch_sat_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_sat_groups_items_parent_id_idx\` ON \`business_lunch_sat_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_sat_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_sat_groups_order_idx\` ON \`business_lunch_sat_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_sat_groups_parent_id_idx\` ON \`business_lunch_sat_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_sun_groups_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`weight\` text,
  	\`price\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch_sun_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_sun_groups_items_order_idx\` ON \`business_lunch_sun_groups_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_sun_groups_items_parent_id_idx\` ON \`business_lunch_sun_groups_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`business_lunch_sun_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`business_lunch\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`business_lunch_sun_groups_order_idx\` ON \`business_lunch_sun_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`business_lunch_sun_groups_parent_id_idx\` ON \`business_lunch_sun_groups\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`business_lunch\` ADD \`popup_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`business_lunch\` ADD \`popup_until\` text DEFAULT '15:00';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`business_lunch_mon_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_mon_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_tue_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_tue_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_wed_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_wed_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_thu_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_thu_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_fri_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_fri_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_sat_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_sat_groups\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_sun_groups_items\`;`)
  await db.run(sql`DROP TABLE \`business_lunch_sun_groups\`;`)
  await db.run(sql`ALTER TABLE \`business_lunch\` DROP COLUMN \`popup_enabled\`;`)
  await db.run(sql`ALTER TABLE \`business_lunch\` DROP COLUMN \`popup_until\`;`)
}
