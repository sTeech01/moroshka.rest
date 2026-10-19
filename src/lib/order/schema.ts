import { z } from "zod";

export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .transform((v) => (v.length === 11 && v.startsWith("8") ? `7${v.slice(1)}` : v))
  .refine((v) => /^7\d{10}$/.test(v), "Введите номер телефона полностью")
  .transform((v) => `+${v}`);

const text = (max: number) => z.string().trim().max(max);

const consent = z.boolean().refine((v) => v, "Нужно согласие на обработку данных");

export const checkoutSchema = z
  .object({
    serviceType: z.enum(["delivery", "pickup"]),
    name: text(80).min(2, "Укажите имя"),
    phone: phoneSchema,
    street: text(120).optional(),
    house: text(20).optional(),
    flat: text(10).optional(),
    entrance: text(10).optional(),
    floor: text(10).optional(),
    deliverAt: z.iso.datetime({ offset: true }).nullable(),
    comment: text(500).optional(),
    payment: z.enum(["cash", "card", "online"]),
    consent,
    // Ловушка для ботов: настоящий пользователь это поле не видит.
    // Заполненное поле не ошибка валидации — API отвечает «успехом», ничего не отправляя
    website: z.string().max(200).optional(),
    lines: z
      .array(
        z.object({
          productId: z.string().min(1),
          sizeId: z.string().nullable(),
          quantity: z.number().int().min(1).max(99),
          modifiers: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(20) })).max(30),
        }),
      )
      .min(1, "Корзина пуста")
      .max(50),
  })
  .superRefine((v, ctx) => {
    if (v.serviceType === "delivery") {
      if (!v.street) ctx.addIssue({ code: "custom", path: ["street"], message: "Укажите улицу" });
      if (!v.house) ctx.addIssue({ code: "custom", path: ["house"], message: "Укажите дом" });
    }
  });

export type CheckoutPayload = z.input<typeof checkoutSchema>;

export const bookingSchema = z.object({
  kind: z.enum(["table", "banquet"]),
  name: text(80).min(2, "Укажите имя"),
  phone: phoneSchema,
  date: z.iso.date(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  guests: z.coerce.number().int().min(1).max(300),
  format: text(120).optional(),
  comment: text(500).optional(),
  consent,
  website: z.string().max(200).optional(),
});

export type BookingPayload = z.input<typeof bookingSchema>;
