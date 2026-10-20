// Демо-данные для показа на Vercel: копия базы без личных данных и копия загруженных фото.
//
//   DEMO_PASSWORD=<пароль> npm run demo:build
//
// demo/payload.db — копия data/payload.db: вместо настоящих пользователей один demo@moroshka.rest
//   с паролем из DEMO_PASSWORD, без сессий и настроек; миграции отмечены применёнными.
// demo/media/ — копия media/ (фото из админки).
// На Vercel база копируется в /tmp при старте (см. payload.config.ts): правки в админке живут
// до перезапуска функции, загрузка новых фото не работает — это витрина, а не рабочий сайт.

import { createClient } from "@libsql/client";
import { copyFileSync, cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 10) throw new Error("Задайте DEMO_PASSWORD (не короче 10 символов)");

const out = path.join(root, "demo");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const dbFile = path.join(out, "payload.db");
copyFileSync(path.join(root, "data", "payload.db"), dbFile);
cpSync(path.join(root, "media"), path.join(out, "media"), { recursive: true });

const db = createClient({ url: pathToFileURL(dbFile).href });

// Личные данные: сессии, настройки интерфейса админки, блокировки документов
for (const t of ["users_sessions", "payload_preferences_rels", "payload_preferences", "payload_locked_documents_rels", "payload_locked_documents", "payload_kv"])
  await db.execute(`delete from "${t}"`);

// Один демо-пользователь. Хеш — как в Payload (generatePasswordSaltHash): pbkdf2-sha256, 600000 итераций, 32 байта
const salt = randomBytes(32).toString("hex");
const hash = "pbkdf2-sha256-v1:" + pbkdf2Sync(password, salt, 600000, 32, "sha256").toString("hex");
const [first] = (await db.execute("select id from users order by id limit 1")).rows;
await db.execute({ sql: "delete from users where id <> ?", args: [first.id] });
await db.execute({
  sql: "update users set email = ?, name = ?, role = 'admin', salt = ?, hash = ?, login_attempts = 0, lock_until = null, reset_password_token = null, reset_password_expiration = null, reset_password_requested_at = null where id = ?",
  args: ["demo@moroshka.rest", "Демо", salt, hash, first.id],
});

// Схема уже соответствует миграциям (её синхронизировал dev-режим) — отмечаем их применёнными,
// иначе Payload в production спросит про применение миграций
const names = readdirSync(path.join(root, "src", "migrations"))
  .filter((f) => /^\d{8}_\d{6}_.+\.ts$/.test(f))
  .map((f) => f.replace(/\.ts$/, ""));
await db.execute("delete from payload_migrations");
const now = new Date().toISOString();
for (const n of names)
  await db.execute({ sql: "insert into payload_migrations (name, batch, updated_at, created_at) values (?, 1, ?, ?)", args: [n, now, now] });

await db.execute("vacuum");
db.close();

console.log(`demo/payload.db готова: пользователь demo@moroshka.rest, миграций ${names.length}; фото: ${readdirSync(path.join(out, "media")).length} файлов`);
