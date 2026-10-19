// Статичные настройки, которые не редактируются в админке.
// Контакты, часы работы и условия доставки — в Payload (/admin → «Настройки»).

export const siteConfig = {
  name: "Морошка",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://moroshka.rest",
  locale: "ru_RU",
} as const;

/** Доставка только по Губкинскому — бизнес-ограничение, поэтому в коде, а не в админке */
export const deliveryConfig = {
  city: "Губкинский",
} as const;

export const features = {
  onlinePayment: process.env.NEXT_PUBLIC_ONLINE_PAYMENT_ENABLED === "true",
} as const;

export const navigation = [
  { href: "/menu", label: "Меню" },
  { href: "/banquets", label: "Банкеты" },
  { href: "/events", label: "Афиша" },
  { href: "/about", label: "О ресторане" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
] as const;
