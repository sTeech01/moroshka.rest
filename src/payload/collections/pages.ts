import type { CollectionConfig } from "payload";
import { anyone, isAdmin, loggedIn } from "../access";
import { revalidateHooks } from "../revalidate";

/** Адреса страниц заданы в коде сайта — создавать новые нет смысла */
export const PAGE_SLUGS = [
  { label: "О ресторане — /about", value: "about" },
  { label: "Условия доставки — внизу страницы /delivery", value: "delivery" },
  { label: "Пользовательское соглашение — /privacy-policy", value: "privacy-policy" },
  { label: "Публичная оферта — /offer", value: "offer" },
  { label: "Правила посещения — /rules", value: "rules" },
];

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Страница", plural: "Страницы" },
  admin: { group: "Контент", useAsTitle: "title", defaultColumns: ["title", "slug", "updatedAt"] },
  access: { read: anyone, create: isAdmin, update: loggedIn, delete: isAdmin },
  fields: [
    { name: "title", label: "Заголовок", type: "text", required: true },
    {
      name: "slug",
      label: "Страница сайта",
      type: "select",
      required: true,
      unique: true,
      options: PAGE_SLUGS,
      admin: { position: "sidebar" },
    },
    {
      name: "description",
      label: "SEO-описание",
      type: "textarea",
      admin: { position: "sidebar", description: "Текст под ссылкой в поиске, до 160 символов" },
    },
    { name: "content", label: "Текст", type: "richText" },
    {
      name: "sections",
      label: "Секции",
      type: "blocks",
      admin: { description: "Блоки под основным текстом: текст с фото, событие с цифрами и фото" },
      blocks: [
        {
          slug: "textImage",
          labels: { singular: "Текст + фото", plural: "Текст + фото" },
          fields: [
            { name: "content", label: "Текст", type: "richText", required: true },
            { name: "image", label: "Фото", type: "upload", relationTo: "media", required: true },
            {
              name: "imagePosition",
              label: "Фото",
              type: "radio",
              defaultValue: "right",
              options: [
                { label: "Справа", value: "right" },
                { label: "Слева", value: "left" },
              ],
            },
          ],
        },
        {
          slug: "highlight",
          labels: { singular: "Событие с цифрами", plural: "События с цифрами" },
          fields: [
            { name: "eyebrow", label: "Надзаголовок", type: "text", admin: { placeholder: "Рекорд России" } },
            { name: "title", label: "Заголовок", type: "text", required: true },
            {
              name: "stats",
              label: "Цифры",
              type: "array",
              maxRows: 4,
              labels: { singular: "Цифра", plural: "Цифры" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", label: "Значение", type: "text", required: true, admin: { placeholder: "110,5 кг" } },
                    { name: "label", label: "Подпись", type: "text", admin: { placeholder: "томлёных рёбер оленя" } },
                  ],
                },
              ],
            },
            { name: "content", label: "Текст", type: "richText" },
            { name: "images", label: "Фото (до 2)", type: "upload", relationTo: "media", hasMany: true, maxRows: 2 },
            {
              type: "row",
              fields: [
                { name: "linkUrl", label: "Ссылка", type: "text" },
                { name: "linkLabel", label: "Текст ссылки", type: "text", defaultValue: "Подробнее" },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: revalidateHooks,
};
