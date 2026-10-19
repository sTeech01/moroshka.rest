import type { GlobalConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";

export const Home: GlobalConfig = {
  slug: "home",
  label: "Главная",
  admin: { group: "Страницы" },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Первый экран",
          fields: [
            { name: "heroTitle", label: "Заголовок", type: "text", required: true },
            { name: "heroSubtitle", label: "Подзаголовок", type: "textarea" },
            { name: "heroImage", label: "Фото", type: "upload", relationTo: "media" },
          ],
        },
        {
          label: "О ресторане",
          fields: [
            { name: "aboutTitle", label: "Заголовок", type: "text" },
            { name: "aboutText", label: "Текст", type: "textarea" },
            { name: "aboutImage", label: "Фото", type: "upload", relationTo: "media" },
          ],
        },
        {
          label: "Кухня и бар",
          fields: [
            {
              type: "row",
              fields: [
                { name: "kitchenText", label: "«Кухня» — подпись", type: "text" },
                { name: "barText", label: "«Бар» — подпись", type: "text" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "kitchenImage", label: "«Кухня» — фото", type: "upload", relationTo: "media" },
                { name: "barImage", label: "«Бар» — фото", type: "upload", relationTo: "media" },
              ],
            },
          ],
        },
        {
          label: "Популярные блюда",
          description: "Блюда из меню iiko для блока «Северная кухня дома». Пусто — первые 4 позиции в наличии",
          fields: [
            {
              name: "featuredDishes",
              label: "Блюда",
              type: "text",
              hasMany: true,
              admin: { components: { Field: "/payload/admin/dish-picker#DishPicker" } },
            },
          ],
        },
        {
          label: "Банкеты",
          fields: [
            { name: "banquetTitle", label: "Заголовок", type: "text" },
            { name: "banquetText", label: "Текст", type: "textarea" },
            { name: "banquetCapacity", label: "Вместимость", type: "text", admin: { placeholder: "до 40 гостей" } },
            { name: "banquetImage", label: "Главное фото", type: "upload", relationTo: "media" },
            {
              name: "gallery",
              label: "Галерея (3 фото)",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              maxRows: 6,
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
