import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ru } from "@payloadcms/translations/languages/ru";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Events } from "./payload/collections/events";
import { Media } from "./payload/collections/media";
import { Pages } from "./payload/collections/pages";
import { Promos } from "./payload/collections/promos";
import { Users } from "./payload/collections/users";
import { Banquets } from "./payload/globals/banquets";
import { BusinessLunch } from "./payload/globals/business-lunch";
import { Delivery } from "./payload/globals/delivery";
import { Home } from "./payload/globals/home";
import { Settings } from "./payload/globals/settings";
import { migrations } from "./migrations";
import { seed } from "./payload/seed";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const secret = process.env.PAYLOAD_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SECRET не задан");
}

/**
 * Демо на Vercel (переменную VERCEL Vercel задаёт сам): диск только для чтения,
 * поэтому база — копия demo/payload.db во временной папке /tmp (правки живут до перезапуска),
 * а фото читаются из demo/media. Собирается командой npm run demo:build.
 * На своём сервере DATABASE_URL задаётся явно — эта ветка не используется.
 */
function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.VERCEL) {
    const tmp = "/tmp/payload.db";
    if (!existsSync(tmp)) copyFileSync(path.join(process.cwd(), "demo", "payload.db"), tmp);
    return `file:${tmp}`;
  }
  return "file:./data/payload.db";
}

export default buildConfig({
  // serverURL не задаём: ссылки на файлы остаются относительными (/api/media/file/...)
  secret: secret || "dev-only-secret-change-me",
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: " — Морошка, админка" },
    dateFormat: "d MMMM yyyy, HH:mm",
  },
  i18n: { supportedLanguages: { ru }, fallbackLanguage: "ru" },
  collections: [Events, Promos, Pages, Media, Users],
  globals: [Home, Banquets, BusinessLunch, Settings, Delivery],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: databaseUrl() },
    // В разработке схема синхронизируется сама (push). В продакшене при старте
    // применяются миграции из src/migrations — после изменения полей: npm run migrate:create
    prodMigrations: migrations,
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  graphQL: { disable: true },
  // Пустую базу заполняем текущим контентом сайта
  onInit: seed,
});
