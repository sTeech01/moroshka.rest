import type { GlobalConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";

export const Banquets: GlobalConfig = {
  slug: "banquets",
  label: "Банкеты и VIP-зал",
  admin: { group: "Страницы" },
  access: { read: anyone, update: loggedIn },
  fields: [
    { name: "title", label: "Заголовок", type: "text", required: true, defaultValue: "Банкеты и VIP-зал" },
    { name: "intro", label: "Вступление", type: "textarea" },
    {
      name: "heroImage",
      label: "Фото первого экрана",
      type: "upload",
      relationTo: "media",
      admin: { description: "Горизонтальное фото зала, от 1600 px по ширине. Поверх ляжет затемнение и текст по центру" },
    },
    {
      name: "halls",
      label: "Залы",
      type: "array",
      labels: { singular: "Зал", plural: "Залы" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", label: "Название", type: "text", required: true },
            { name: "capacity", label: "Вместимость", type: "text" },
          ],
        },
        { name: "description", label: "Описание", type: "textarea" },
      ],
    },
    {
      name: "gallery",
      label: "Галерея",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: { description: "Пусто — берутся фото с главной" },
    },
    { name: "content", label: "Текст страницы", type: "richText" },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
