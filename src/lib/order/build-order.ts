import "server-only";
import type { z } from "zod";
import { priceSelection } from "@/lib/cart/pricing";
import { getDelivery } from "@/lib/content";
import { deliveryPriceFor } from "@/lib/delivery";
import { getMenuFresh } from "@/lib/menu/get-menu";
import type { OrderInput, OrderLine } from "@/lib/providers/types";
import type { checkoutSchema } from "./schema";

type Checkout = z.output<typeof checkoutSchema>;

export type BuildResult = { ok: true; order: OrderInput } | { ok: false; error: string };

/** Пересчитывает заказ по актуальному меню: цены из браузера не используются */
export async function buildOrder(data: Checkout): Promise<BuildResult> {
  const [menu, delivery] = await Promise.all([getMenuFresh(), getDelivery()]);

  if (data.serviceType === "delivery" && !delivery.enabled) {
    return { ok: false, error: delivery.notice ?? "Доставка временно не работает. Доступен самовывоз." };
  }
  const dishes = new Map(menu.categories.flatMap((c) => c.dishes).map((d) => [d.id, d]));

  const lines: OrderLine[] = [];
  for (const line of data.lines) {
    const dish = dishes.get(line.productId);
    if (!dish) return { ok: false, error: "Одна из позиций больше недоступна. Обновите корзину." };
    if (!dish.inStock) return { ok: false, error: `«${dish.name}» сейчас нет в наличии` };

    const priced = priceSelection(dish, line.sizeId, line.modifiers);
    if (!priced.ok) return { ok: false, error: `${dish.name}: ${priced.error}` };

    lines.push({
      productId: dish.id,
      name: dish.name,
      sizeId: priced.size.id,
      sizeName: priced.size.name,
      quantity: line.quantity,
      unitPrice: priced.unitPrice,
      modifiers: priced.modifiers,
    });
  }

  const itemsSum = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  if (data.serviceType === "delivery" && itemsSum < delivery.minOrderSum) {
    return { ok: false, error: `Минимальная сумма заказа на доставку — ${delivery.minOrderSum} ₽` };
  }
  if (data.serviceType === "pickup" && !delivery.pickupEnabled) {
    return { ok: false, error: "Самовывоз недоступен" };
  }

  const deliveryPrice = data.serviceType === "delivery" ? deliveryPriceFor(delivery, itemsSum) : 0;

  return {
    ok: true,
    order: {
      serviceType: data.serviceType,
      customer: { name: data.name, phone: data.phone },
      address:
        data.serviceType === "delivery"
          ? {
              // Город не принимается от клиента — доставка только по Губкинскому
              city: delivery.city,
              street: data.street!,
              house: data.house!,
              flat: data.flat,
              entrance: data.entrance,
              floor: data.floor,
            }
          : undefined,
      deliverAt: data.deliverAt,
      comment: data.comment,
      payment: data.payment,
      lines,
      itemsSum,
      deliveryPrice,
      total: itemsSum + deliveryPrice,
    },
  };
}
