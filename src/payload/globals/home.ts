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
            {
              name: "heroImage",
              label: "Фото",
              type: "upload",
              relationTo: "media",
              admin: { description: "Сейчас на первом экране видео (public/video/hero.mp4); фото — для превью ссылок в соцсетях и на случай, если видео уберут" },
            },
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
          description: "Блюда из меню доставки для блока «Северная кухня дома». Пусто — по одному блюду с фото из разных разделов",
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
      ],
    },
    // Блоки «О ресторане» и «VIP-зал и банкеты» сняты с главной, у страницы «Банкеты» свои поля.
    // Поля скрыты из админки и API, но оставлены в схеме: удаление колонок — миграция с потерей
    // данных. Убрать вместе с миграцией, когда будет удобно
    { name: "aboutTitle", type: "text", hidden: true },
    { name: "aboutText", type: "textarea", hidden: true },
    { name: "aboutImage", type: "upload", relationTo: "media", hidden: true },
    { name: "banquetTitle", type: "text", hidden: true },
    { name: "banquetText", type: "textarea", hidden: true },
    { name: "banquetCapacity", type: "text", hidden: true },
    { name: "banquetImage", type: "upload", relationTo: "media", hidden: true },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true, hidden: true },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
