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

/** Стоимость доставки для суммы товаров */
export function deliveryPriceFor(settings: DeliverySettings, itemsSum: number): number {
  if (settings.freeFrom && itemsSum >= settings.freeFrom) return 0;
  return settings.price;
}
