// Готовит изображения дизайна для сайта: логотип с прозрачностью, гравюру, фото в WebP.
// Запуск: node scripts/prepare-images.mjs ../design/img
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const src = process.argv[2] ?? "../design/img";
const out = "public/images";
mkdirSync(path.join(out, "home"), { recursive: true });

// Логотип с ягодой на чёрном фоне (logo.png) → прозрачный WebP.
// Чёрный «вычитается»: alpha = max(R,G,B), цвет = RGB / alpha — поверх тёмного фона сайта без плашки.
// Пропорции 605×159 зашиты в components/logo.tsx — при смене исходника поправить там.
// Фавикон (src/app/icon.png, apple-icon.png, favicon.ico) — ягода из logo-berry.png.
{
  const { data, info } = await sharp(path.join(src, "logo.png")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const a = Math.max(data[i], data[i + 1], data[i + 2]);
    if (a < 8) continue;
    rgba[j] = Math.min(255, Math.round((data[i] * 255) / a));
    rgba[j + 1] = Math.min(255, Math.round((data[i + 1] * 255) / a));
    rgba[j + 2] = Math.min(255, Math.round((data[i + 2] * 255) / a));
    rgba[j + 3] = a;
  }
  const png = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const res = await sharp(png).trim({ threshold: 1 }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(out, "logo.webp"));
  console.log("logo", res.width, res.height);
}

// Гравюра с ягодами (уже прозрачная)
await sharp(path.join(src, "berries.png")).resize({ width: 2000 }).webp({ quality: 80, alphaQuality: 90 }).toFile(path.join(out, "berries.webp"));

// Фото для главной
const photos = {
  "hall.jpg": ["hero.webp", 2000],
  "tree.jpg": ["about.webp", 1200],
  "uha.jpg": ["kitchen.webp", 1400],
  "bar.jpg": ["bar.webp", 1400],
  "vip.jpg": ["vip.webp", 1600],
  "vip-berries.jpg": ["gallery-1.webp", 1200],
  "stairs.jpg": ["gallery-2.webp", 1200],
};
for (const [file, [name, width]] of Object.entries(photos)) {
  const info = await sharp(path.join(src, file)).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(out, "home", name));
  console.log(name, info.width, info.height, Math.round(info.size / 1024) + " KB");
}
