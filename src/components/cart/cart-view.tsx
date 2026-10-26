"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { cartTotal, useCart, useCartHydrated } from "@/store/cart";
import { MinOrderProgress } from "./cart-summary";

export function CartView() {
  const hydrated = useCartHydrated();
  const { lines, setQuantity, remove } = useCart();
  const total = cartTotal(lines);

  if (!hydrated) return <div className="skeleton h-40 rounded-card" />;

  if (lines.length === 0) {
    return (
      <div className="card-soft px-6 py-14 text-center">
        <p className="h-display text-3xl">Корзина пуста</p>
        <p className="mt-2 text-muted">Загляните в меню — там северная кухня с доставкой по Губкинскому</p>
        <Link href="/delivery" className="btn btn-berry mt-8">
          Перейти в меню
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <ul className="space-y-3">
        {lines.map((l) => (
          <li key={l.key} className="card-soft flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1 basis-56">
              <Link href={`/delivery/${l.slug}`} className="text-[17px] font-semibold hover:text-berry">
                {l.name}
                {l.sizeName && <span className="font-normal text-muted"> · {l.sizeName}</span>}
              </Link>
              {l.modifiers.length > 0 && <div className="mt-0.5 text-sm text-muted">{l.modifiers.map((m) => m.name).join(", ")}</div>}
              <div className="mt-0.5 text-sm text-muted">{formatPrice(l.unitPrice)} за шт.</div>
            </div>
            <div className="flex h-11 items-center rounded-soft bg-fill/60">
              <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => setQuantity(l.key, l.quantity - 1)} aria-label={`Убрать: ${l.name}`}>
                −
              </button>
              <span className="min-w-5 text-center font-bold">{l.quantity}</span>
              <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => setQuantity(l.key, l.quantity + 1)} aria-label={`Добавить ещё: ${l.name}`}>
                +
              </button>
            </div>
            <div className="w-24 text-right text-[17px] font-bold">{formatPrice(l.unitPrice * l.quantity)}</div>
            <button
              type="button"
              onClick={() => remove(l.key)}
              className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Удалить: ${l.name}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <aside className="card-soft flex flex-col gap-4 p-7 lg:sticky lg:top-28">
        <div className="flex justify-between text-lg font-bold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
        <MinOrderProgress total={total} />
        <Link href="/checkout" className="btn btn-berry h-14">
          Оформить заказ
        </Link>
        <Link href="/delivery" className="text-center text-sm font-semibold text-muted hover:text-text">
          ← Продолжить выбор
        </Link>
      </aside>
    </div>
  );
}
