import type { Field, GlobalConfig } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";
import { LUNCH_DAYS } from "../../lib/business-lunch";

/** Разделы меню (салаты, супы, горячее…) — одинаковая структура у общего меню и у каждого дня */
const groupsField = (description: string): Field => ({
  name: "groups",
  label: "Разделы",
  type: "array",
  labels: { singular: "Раздел", plural: "Разделы" },
  admin: { description },
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
});

/** Бизнес-ланч: обед в зале, у каждого дня недели своё меню. В iiko его нет — состав и цены ведутся здесь */
export const BusinessLunch: GlobalConfig = {
  slug: "business-lunch",
  label: "Бизнес-ланч",
  admin: { group: "Страницы", description: "Страница /business-lunch и окно с меню дня при входе на сайт. Состав и цены меняются здесь" },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Общее",
          fields: [
            {
              name: "enabled",
              label: "Показывать на сайте",
              type: "checkbox",
              defaultValue: true,
              admin: { description: "Снимите — страница отдаст 404 и окно не появится (промо-баннеры выключите в «Промо и акции»)" },
            },
            { name: "title", label: "Заголовок", type: "text", required: true, defaultValue: "Бизнес-ланч" },
            { name: "schedule", label: "Когда", type: "text", required: true, defaultValue: "По будням с 12:00 до 15:00" },
            { name: "intro", label: "Вступление", type: "textarea" },
            {
              name: "note",
              label: "Примечание внизу",
              type: "text",
              defaultValue: "Кроме бизнес-ланча вы всегда можете заказать любое блюдо из основного меню",
            },
            { name: "image", label: "Фото", type: "upload", relationTo: "media" },
            {
              type: "row",
              fields: [
                {
                  name: "popupEnabled",
                  label: "Окно с меню дня при входе на сайт",
                  type: "checkbox",
                  defaultValue: true,
                  admin: { width: "50%", description: "Гость видит его один раз в день, если на сегодня есть меню" },
                },
                {
                  name: "popupUntil",
                  label: "Показывать окно до",
                  type: "text",
                  defaultValue: "15:00",
                  admin: { width: "50%", placeholder: "15:00", description: "По времени Губкинского. Пусто — весь день" },
                  validate: (v: string | null | undefined) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v) || "Формат ЧЧ:ММ, например 15:00",
                },
              ],
            },
          ],
        },
        {
          label: "Каждый день",
          description:
            "Что входит в ланч в любой день (напитки, хлеб…). Показывается после меню дня. " +
            "Пока ни у одного дня меню не заполнено, этот список считается меню на все будни.",
          fields: [groupsField("Салаты, супы, горячее… Название раздела можно не указывать")],
        },
        ...LUNCH_DAYS.map((d) => ({
          name: d.key,
          label: d.short,
          description: `Меню на ${d.accusative}. Пусто — в этот день бизнес-ланча нет.`,
          fields: [groupsField("Название раздела можно не указывать")],
        })),
      ],
    },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
