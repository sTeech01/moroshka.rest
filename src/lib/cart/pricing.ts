import type { Dish, DishSize } from "@/lib/menu/types";

export type ModifierChoice = { id: string; quantity: number };

export type PricedSelection =
  | {
      ok: true;
      size: DishSize;
      unitPrice: number;
      modifiers: { id: string; groupId: string; name: string; quantity: number; price: number }[];
    }
  | { ok: false; error: string };

/**
 * Проверяет выбор размера и модификаторов по правилам iiko (min/max групп)
 * и считает цену одной позиции. Используется и в браузере, и на сервере.
 */
export function priceSelection(dish: Dish, sizeId: string | null, choices: ModifierChoice[]): PricedSelection {
  const size = dish.sizes.find((s) => s.id === sizeId) ?? (sizeId === null ? dish.sizes[0] : undefined);
  if (!size) return { ok: false, error: "Выберите размер" };

  const modifiers: Extract<PricedSelection, { ok: true }>["modifiers"] = [];
  const known = new Set<string>();

  for (const group of size.modifierGroups) {
    let groupCount = 0;
    for (const option of group.options) {
      known.add(option.id);
      const quantity = choices.find((c) => c.id === option.id)?.quantity ?? 0;
      if (quantity === 0) continue;
      if (quantity > Math.max(option.max, 1)) return { ok: false, error: `Слишком много: ${option.name}` };
      groupCount += quantity;
      modifiers.push({ id: option.id, groupId: group.id, name: option.name, quantity, price: option.price });
    }
    if (groupCount < group.min) return { ok: false, error: `Выберите: ${group.name.toLowerCase()}` };
    if (group.max > 0 && groupCount > group.max)
      return { ok: false, error: `${group.name}: не больше ${group.max}` };
  }

  if (choices.some((c) => c.quantity > 0 && !known.has(c.id)))
    return { ok: false, error: "Модификатор недоступен" };

  const unitPrice = size.price + modifiers.reduce((sum, m) => sum + m.price * m.quantity, 0);
  return { ok: true, size, unitPrice, modifiers };
}

/** Ключ строки корзины: одинаковое блюдо с одинаковым выбором складывается */
export function lineKey(productId: string, sizeId: string | null, choices: ModifierChoice[]): string {
  const mods = choices
    .filter((c) => c.quantity > 0)
    .map((c) => `${c.id}:${c.quantity}`)
    .sort()
    .join(",");
  return `${productId}|${sizeId ?? ""}|${mods}`;
}
