import type { GlobalConfig, TextFieldSingleValidation } from "payload";
import { anyone, loggedIn } from "../access";
import { revalidateGlobal } from "../revalidate";

const timeValidate: TextFieldSingleValidation = (value) =>
  !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) || "Формат ЧЧ:ММ, например 23:30";

export const Delivery: GlobalConfig = {
  slug: "delivery",
  label: "Доставка",
  admin: {
    group: "Настройки",
    description: "Город доставки — только Губкинский (задан в коде). Изменения применяются к новым заказам сразу",
  },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      name: "enabled",
      label: "Доставка работает",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Снимите, чтобы временно остановить приём заказов на доставку (самовывоз останется)" },
    },
    {
      name: "notice",
      label: "Объявление в корзине",
      type: "text",
      admin: { description: "Например: «Сегодня доставка до 21:00». Пусто — не показывается" },
    },
    {
      type: "row",
      fields: [
        { name: "minOrderSum", label: "Минимальный заказ, ₽", type: "number", required: true, min: 0, defaultValue: 1000 },
        { name: "price", label: "Стоимость доставки, ₽", type: "number", required: true, min: 0, defaultValue: 0 },
        {
          name: "freeFrom",
          label: "Бесплатно от, ₽",
          type: "number",
          min: 0,
          admin: { description: "Пусто — без бесплатной доставки" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "acceptFrom", label: "Приём заказов с", type: "text", required: true, defaultValue: "12:00", validate: timeValidate },
        { name: "acceptUntil", label: "Приём заказов до", type: "text", required: true, defaultValue: "23:00", validate: timeValidate },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "leadTimeMinutes", label: "Готовность заказа, мин", type: "number", required: true, min: 0, defaultValue: 60 },
        { name: "slotMinutes", label: "Шаг слотов «ко времени», мин", type: "number", required: true, min: 10, defaultValue: 30 },
      ],
    },
    {
      name: "deliveryTimeText",
      label: "Время доставки для гостей",
      type: "text",
      admin: { placeholder: "60–90 минут" },
    },
    { name: "pickupEnabled", label: "Самовывоз", type: "checkbox", defaultValue: true },
  ],
  hooks: { afterChange: [revalidateGlobal] },
};
