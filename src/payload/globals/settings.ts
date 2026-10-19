import type { GlobalConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Ресторан",
  admin: { group: "Настройки", description: "Контакты и часы работы — шапка, подвал, «Контакты»" },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: "row",
      fields: [
        { name: "phone", label: "Телефон", type: "text", required: true, defaultValue: "+7 (922) 067-78-87" },
        { name: "banquetPhone", label: "Телефон для банкетов", type: "text", admin: { description: "Если пусто — общий" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", label: "Email", type: "email" },
        { name: "address", label: "Адрес", type: "text", required: true, defaultValue: "г. Губкинский" },
      ],
    },
    {
      name: "hours",
      label: "Часы работы",
      type: "array",
      labels: { singular: "Строка", plural: "Строки" },
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "days", label: "Дни", type: "text", required: true, admin: { placeholder: "Пн–Сб" } },
            { name: "time", label: "Время", type: "text", required: true, admin: { placeholder: "12:00–00:00" } },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "vk", label: "ВКонтакте", type: "text" },
        { name: "telegram", label: "Telegram", type: "text" },
      ],
    },
    {
      name: "geo",
      label: "Точка на карте",
      type: "group",
      admin: { description: "Координаты из Яндекс Карт: правый клик по точке → «Что здесь?»" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "lat", label: "Широта", type: "number", defaultValue: 64.4339 },
            { name: "lng", label: "Долгота", type: "number", defaultValue: 76.5002 },
          ],
        },
      ],
    },
    { name: "legal", label: "Реквизиты для подвала", type: "textarea", admin: { placeholder: "ООО «…», ИНН …, ОГРН …" } },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
