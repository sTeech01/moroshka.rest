import type { CollectionConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateHooks } from "../revalidate";

export const Promos: CollectionConfig = {
  slug: "promos",
  labels: { singular: "Промо-баннер", plural: "Промо и акции" },
  admin: {
    group: "Контент",
    useAsTitle: "title",
    defaultColumns: ["title", "placement", "active", "startsAt", "endsAt"],
    description: "Бизнес-ланч, сезонное меню, акции. Показываются на главной и/или в меню",
  },
  defaultSort: "order",
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: "title", label: "Заголовок", type: "text", required: true },
    { name: "text", label: "Текст", type: "textarea" },
    { name: "image", label: "Фото", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "linkUrl", label: "Ссылка", type: "text", admin: { description: "Например /business-lunch, /delivery или /banquets" } },
        { name: "linkLabel", label: "Текст кнопки", type: "text", defaultValue: "Подробнее" },
      ],
    },
    {
      name: "placement",
      label: "Где показывать",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["home"],
      options: [
        { label: "Главная", value: "home" },
        { label: "Меню и Доставка", value: "menu" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "active", label: "Включён", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    {
      name: "startsAt",
      label: "Показывать с",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" } },
    },
    {
      name: "endsAt",
      label: "Показывать до",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" } },
    },
    {
      name: "order",
      label: "Порядок",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Меньше — выше" },
    },
  ],
  hooks: revalidateHooks,
};
