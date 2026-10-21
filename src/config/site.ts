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
  /**
   * Онлайн-заказы: раздел заказа (/delivery), корзина, оформление, кнопки «в корзину».
   * Включены по умолчанию. Что именно доступно — доставка и/или самовывоз — задаётся в админке
   * («Настройки → Доставка»). Сейчас у ресторана только самовывоз (решение заказчика 21.10.2026),
   * поэтому раздел называется «Самовывоз». Выключить всё целиком: NEXT_PUBLIC_ONLINE_ORDERS_ENABLED=false.
   */
  onlineOrders: process.env.NEXT_PUBLIC_ONLINE_ORDERS_ENABLED !== "false",
  onlinePayment: process.env.NEXT_PUBLIC_ONLINE_PAYMENT_ENABLED === "true",
} as const;

export type NavItem = { href: string; label: string };

/** Пункты меню сайта. Раздел заказа — «Доставка» или «Самовывоз» по настройкам из админки */
export function getNavigation(delivery: { enabled: boolean; pickupEnabled: boolean }): NavItem[] {
  const ordering = features.onlineOrders && (delivery.enabled || delivery.pickupEnabled);
  return [
    { href: "/menu", label: "Меню" },
    ...(ordering ? [{ href: "/delivery", label: delivery.enabled ? "Доставка" : "Самовывоз" }] : []),
    { href: "/banquets", label: "Банкеты" },
    { href: "/events", label: "Афиша" },
    { href: "/about", label: "О ресторане" },
    { href: "/contacts", label: "Контакты" },
  ];
}
