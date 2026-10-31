"use client";

import { lineKey } from "@/lib/cart/pricing";
import type { Dish } from "@/lib/menu/types";
import { useCart, useCartHydrated } from "@/store/cart";

/**
 * «В корзину» для блюда без обязательного выбора; после добавления — счётчик.
 * variant="icon" — тонкий круглый «+» и тонкий счётчик (минималистичные карточки на главной);
 * variant="solid" — заметный оранжевый круглый «+» и оранжевый счётчик (меню ресторана).
 */
export function QuickAdd({ dish, tone = "ink", variant = "button" }: { dish: Dish; tone?: "ink" | "berry"; variant?: "button" | "icon" | "solid" }) {
  const hydrated = useCartHydrated();
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  const key = lineKey(dish.id, size.id, []);
  const quantity = useCart((s) => s.lines.find((l) => l.key === key)?.quantity ?? 0);
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const addToCart = () =>
    add({
      productId: dish.id,
      slug: dish.slug,
      name: dish.name,
      image: dish.image,
      sizeId: size.id,
      sizeName: null,
      modifiers: [],
      unitPrice: size.price,
    });

  if (variant === "solid") {
    if (hydrated && quantity > 0) {
      return (
        <div className="flex h-10 shrink-0 items-center rounded-full bg-berry font-bold text-night">
          <button type="button" className="h-10 w-9 text-lg" onClick={() => setQuantity(key, quantity - 1)} aria-label={`Убрать: ${dish.name}`}>
            −
          </button>
          <span className="min-w-4 text-center text-sm" aria-live="polite">{quantity}</span>
          <button type="button" className="h-10 w-9 text-lg" onClick={() => setQuantity(key, quantity + 1)} aria-label={`Добавить ещё: ${dish.name}`}>
            +
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={addToCart}
        aria-label={`В корзину: ${dish.name}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-berry text-night transition-[background-color,transform] duration-200 hover:bg-berry-hover active:scale-90"
      >
        <PlusIcon strokeWidth={2} />
      </button>
    );
  }

  if (variant === "icon") {
    if (hydrated && quantity > 0) {
      return (
        <div className="flex h-9 items-center rounded-full bg-berry/10 text-berry ring-1 ring-berry/60 ring-inset">
          <button type="button" className="h-9 w-8 text-base" onClick={() => setQuantity(key, quantity - 1)} aria-label={`Убрать: ${dish.name}`}>
            −
          </button>
          <span className="min-w-4 text-center text-sm" aria-live="polite">{quantity}</span>
          <button type="button" className="h-9 w-8 text-base" onClick={() => setQuantity(key, quantity + 1)} aria-label={`Добавить ещё: ${dish.name}`}>
            +
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={addToCart}
        aria-label={`В корзину: ${dish.name}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-soft ring-1 ring-border ring-inset transition-[color,box-shadow] duration-200 hover:text-berry hover:ring-berry"
      >
        <PlusIcon />
      </button>
    );
  }

  if (hydrated && quantity > 0) {
    return (
      <div className="flex h-11 items-center rounded-soft bg-berry text-night">
        <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => setQuantity(key, quantity - 1)} aria-label={`Убрать: ${dish.name}`}>
          −
        </button>
        <span className="min-w-5 text-center font-bold" aria-live="polite">{quantity}</span>
        <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => setQuantity(key, quantity + 1)} aria-label={`Добавить ещё: ${dish.name}`}>
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-sm ${tone === "berry" ? "btn-berry" : "btn-ink"}`}
      onClick={addToCart}
    >
      В корзину
    </button>
  );
}

export function PlusIcon({ strokeWidth = 1.25 }: { strokeWidth?: number }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden>
      <path d="M7 1v12M1 7h12" />
    </svg>
  );
}
