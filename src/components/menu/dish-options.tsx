"use client";

import { useMemo, useState } from "react";
import { priceSelection, type ModifierChoice } from "@/lib/cart/pricing";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/menu/types";
import { useCart } from "@/store/cart";

/** Выбор размера, модификаторов и количества на странице блюда */
export function DishOptions({ dish }: { dish: Dish }) {
  const add = useCart((s) => s.add);
  const [sizeId, setSizeId] = useState<string | null>((dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0]).id);
  const [choices, setChoices] = useState<ModifierChoice[]>(() =>
    dish.sizes
      .flatMap((s) => s.modifierGroups.flatMap((g) => g.options))
      .filter((o) => o.byDefault > 0)
      .map((o) => ({ id: o.id, quantity: o.byDefault })),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tried, setTried] = useState(false);

  const size = dish.sizes.find((s) => s.id === sizeId) ?? dish.sizes[0];
  const priced = useMemo(() => priceSelection(dish, sizeId, choices), [dish, sizeId, choices]);

  const touch = () => {
    setAdded(false);
    setTried(false);
  };

  const toggle = (groupId: string, optionId: string) => {
    const group = size.modifierGroups.find((g) => g.id === groupId)!;
    const groupIds = new Set(group.options.map((o) => o.id));
    const selected = choices.some((c) => c.id === optionId);
    touch();
    setChoices((prev) => {
      if (selected) return prev.filter((c) => c.id !== optionId);
      // Группа с одним вариантом работает как радиокнопка
      if (group.max === 1) return [...prev.filter((c) => !groupIds.has(c.id)), { id: optionId, quantity: 1 }];
      // Лимит группы: самый ранний выбор уступает новому
      const inGroup = prev.filter((c) => groupIds.has(c.id));
      const base = group.max > 0 && inGroup.length >= group.max ? prev.filter((c) => c.id !== inGroup[0].id) : prev;
      return [...base, { id: optionId, quantity: 1 }];
    });
  };

  if (!dish.inStock) return <p className="text-muted">Сейчас этого блюда нет в наличии.</p>;

  const submit = () => {
    if (!priced.ok) return setTried(true);
    add({
      productId: dish.id,
      slug: dish.slug,
      name: dish.name,
      image: dish.image,
      sizeId: priced.size.id,
      sizeName: dish.sizes.length > 1 ? priced.size.name : null,
      modifiers: priced.modifiers.map((m) => ({ id: m.id, name: m.name, quantity: m.quantity })),
      unitPrice: priced.unitPrice,
      quantity,
    });
    setAdded(true);
  };

  return (
    <div className="space-y-7">
      {dish.sizes.length > 1 && (
        <fieldset>
          <legend className="label">Размер</legend>
          <div className="flex flex-wrap gap-2">
            {dish.sizes.map((s) => (
              <button
                key={s.id ?? "default"}
                type="button"
                aria-pressed={s.id === sizeId}
                onClick={() => {
                  touch();
                  setSizeId(s.id);
                  setChoices([]);
                }}
                className="pill"
              >
                {s.name} · {formatPrice(s.price)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {size.modifierGroups.map((group) => (
        <fieldset key={group.id}>
          <legend className="label">
            {group.name}
            {group.min > 0 ? <span className="text-berry"> — обязательно</span> : group.max > 1 ? ` — до ${group.max}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(group.id, o.id)}
                aria-pressed={choices.some((c) => c.id === o.id)}
                className="pill"
              >
                {o.name}
                {o.price > 0 && ` +${formatPrice(o.price)}`}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {/* На телефоне панель прилипает к низу экрана, как в макете */}
      <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface px-4 pt-3 pb-5 md:static md:mx-0 md:border-0 md:p-0">
        <p className="min-h-5 text-[13px] text-berry" aria-live="polite">
          {tried && !priced.ok ? priced.error : ""}
        </p>
        <div className="mt-1 flex gap-2.5">
          <div className="flex h-14 items-center rounded-full border border-border">
            <button type="button" className="h-14 w-12 text-xl font-bold" onClick={() => { touch(); setQuantity((q) => Math.max(1, q - 1)); }} aria-label="Меньше">
              −
            </button>
            <span className="min-w-5 text-center font-bold">{quantity}</span>
            <button type="button" className="h-14 w-12 text-xl font-bold" onClick={() => { touch(); setQuantity((q) => Math.min(99, q + 1)); }} aria-label="Больше">
              +
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            className={`btn h-14 flex-1 ${priced.ok ? "btn-berry" : "bg-fill text-muted"}`}
          >
            {added ? "Добавлено в корзину" : `В корзину · ${formatPrice((priced.ok ? priced.unitPrice : size.price) * quantity)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
