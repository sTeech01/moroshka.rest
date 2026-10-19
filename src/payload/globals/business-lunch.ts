import type { GlobalConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";

/** Бизнес-ланч: обед в зале по будням. В iiko его нет — состав и цены ведутся здесь */
export const BusinessLunch: GlobalConfig = {
  slug: "business-lunch",
  label: "Бизнес-ланч",
  admin: { group: "Страницы", description: "Страница /business-lunch. Состав и цены меняются здесь" },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      name: "enabled",
      label: "Показывать на сайте",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Снимите — страница отдаст 404 (промо-баннеры выключите в «Промо и акции»)" },
    },
    { name: "title", label: "Заголовок", type: "text", required: true, defaultValue: "Бизнес-ланч" },
    { name: "schedule", label: "Когда", type: "text", required: true, defaultValue: "По будням с 12:00 до 15:00" },
    { name: "intro", label: "Вступление", type: "textarea" },
    {
      name: "groups",
      label: "Разделы",
      type: "array",
      labels: { singular: "Раздел", plural: "Разделы" },
      admin: { description: "Салаты, супы, горячее… Название раздела можно не указывать" },
      fields: [
        { name: "title", label: "Название раздела", type: "text" },
        {
          name: "items",
          label: "Позиции",
          type: "array",
          labels: { singular: "Позиция", plural: "Позиции" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", label: "Название", type: "text", required: true, admin: { width: "60%" } },
                { name: "weight", label: "Выход", type: "text", admin: { width: "20%", placeholder: "250г" } },
                { name: "price", label: "Цена, ₽", type: "number", required: true, min: 0, admin: { width: "20%" } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "note",
      label: "Примечание внизу",
      type: "text",
      defaultValue: "Кроме бизнес-ланча вы всегда можете заказать любое блюдо из основного меню",
    },
    { name: "image", label: "Фото", type: "upload", relationTo: "media" },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
