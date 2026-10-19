import type { CollectionConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { slugField } from "../fields/slug";
import { revalidateHooks } from "../revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Событие", plural: "Афиша" },
  admin: {
    group: "Контент",
    useAsTitle: "title",
    defaultColumns: ["title", "date", "updatedAt"],
    description: "Прошедшие события скрываются с сайта автоматически",
  },
  defaultSort: "-date",
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: "title", label: "Название", type: "text", required: true },
    slugField(),
    {
      name: "date",
      label: "Дата и время",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm", displayFormat: "d MMMM yyyy, HH:mm" } },
    },
    { name: "summary", label: "Кратко", type: "textarea", admin: { description: "1–2 предложения для карточки" } },
    { name: "cover", label: "Обложка", type: "upload", relationTo: "media" },
    { name: "content", label: "Описание", type: "richText" },
  ],
  hooks: revalidateHooks,
};
