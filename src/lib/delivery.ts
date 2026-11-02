// Условия доставки. Значения приходят из админки (глобал «Доставка»),
// тип и расчёты общие для браузера и сервера.

export type DeliverySettings = {
  city: string;
  enabled: boolean;
  notice: string | null;
  minOrderSum: number;
  price: number;
  freeFrom: number | null;
  acceptFrom: string;
  acceptUntil: string;
  leadTimeMinutes: number;
  slotMinutes: number;
  deliveryTimeText: string | null;
  pickupEnabled: boolean;
};

/**
 * Подписи блока заказа на главной. Пока у ресторана нет доставки (выключена в админке) —
 * самовывоз: заказ на сайте из основного меню, забрать в ресторане.
 */
export function orderSection(d: Pick<DeliverySettings, "enabled" | "pickupEnabled">) {
  if (d.enabled) {
    return {
      homeEyebrow: "Доставка из ресторана",
      homeTitle: "Северная кухня дома",
      homeLink: "Все блюда с доставкой →",
    };
  }
  return {
    homeEyebrow: "Закажите на сайте — заберите в ресторане",
    homeTitle: "Северная кухня с собой",
    homeLink: "Все блюда с собой →",
  };
}

/** Время до готовности заказа, от которого считаются слоты «ко времени»: самовывоз — 30 минут */
export const PICKUP_LEAD_MINUTES = 30;

/** Стоимость доставки для суммы товаров */
export function deliveryPriceFor(settings: DeliverySettings, itemsSum: number): number {
  if (settings.freeFrom && itemsSum >= settings.freeFrom) return 0;
  return settings.price;
}
