import type { CollectionConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateHooks } from "../revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Файл", plural: "Медиа" },
  admin: { group: "Контент", defaultColumns: ["filename", "alt", "updatedAt"] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  upload: {
    // На Vercel (демо) — копия фото из demo/media, только чтение; см. payload.config.ts
    staticDir: process.env.VERCEL ? "demo/media" : "media",
    mimeTypes: ["image/*"],
    // Фото с телефона бывают по 5–10 МБ: уменьшаем оригинал и переводим в WebP
    resizeOptions: { width: 2400, withoutEnlargement: true },
    formatOptions: { format: "webp", options: { quality: 82 } },
    imageSizes: [{ name: "thumbnail", width: 400, formatOptions: { format: "webp", options: { quality: 75 } } }],
    adminThumbnail: "thumbnail",
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      label: "Описание (alt)",
      type: "text",
      required: true,
      admin: { description: "Что на фото — для незрячих посетителей и поисковиков" },
    },
  ],
  hooks: revalidateHooks,
};
