"use client";

import Link from "next/link";
import { useDelivery } from "@/components/delivery-context";
import { PICKUP_LEAD_MINUTES } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { cartTotal, useCart, useCartHydrated } from "@/store/cart";

/** Шкала до минимальной суммы доставки + объявление из админки */
export function MinOrderProgress({ total }: { total: number }) {
  const d = useDelivery();
  const left = d.minOrderSum - total;

  if (!d.enabled) {
    // Доставки нет (так сейчас у ресторана): заказ на сайте — забрать в ресторане
    return (
      <p className="text-[13px] text-muted">
        {d.pickupEnabled
          ? `Самовывоз из ресторана: заказ обычно готов через ${PICKUP_LEAD_MINUTES} минут.`
          : (d.notice ?? "Заказы на сайте временно не принимаются.")}
        {d.pickupEnabled && d.notice && <span className="mt-1 block font-semibold text-text">{d.notice}</span>}
      </p>
    );
  }

  const toFree = d.freeFrom && total < d.freeFrom ? d.freeFrom - total : 0;

  return (
    <div className="space-y-2">
      <div className="h-1 bg-fill">
        <div className="h-1 bg-berry transition-[width]" style={{ width: `${Math.min(100, (total / Math.max(d.minOrderSum, 1)) * 100)}%` }} />
      </div>
      <p className="text-[13px] text-muted">
        {left > 0
          ? `До минимального заказа на доставку ${formatPrice(left)}.${d.pickupEnabled ? " Самовывоз — без минимума" : ""}`
          : toFree > 0
            ? `До бесплатной доставки ${formatPrice(toFree)}`
            : `Доставка по ${d.city === "Губкинский" ? "Губкинскому" : d.city} доступна`}
      </p>
      {d.notice && <p className="text-[13px] font-semibold">{d.notice}</p>}
    </div>
  );
}

/**
 * Корзина сбоку от меню на десктопе. Закреплена при прокрутке ниже шапки (76px)
 * и полосы разделов меню (~60px). Длинный список прокручивается внутри, итог и кнопка всегда видны.
 */
export function CartSummary() {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const total = cartTotal(lines);

  return (
    <aside className="sticky top-40 flex max-h-[calc(100dvh-11rem)] flex-col gap-4 border border-border bg-[#fffdf9] p-7">
      <h2 className="h-display text-[28px]">Корзина</h2>
      {!hydrated ? (
        <div className="h-16 animate-pulse bg-fill" />
      ) : lines.length === 0 ? (
        <p className="text-[15px] text-muted">Добавьте блюда из меню</p>
      ) : (
        <ul className="-mr-3 min-h-0 space-y-2.5 overflow-y-auto pr-3 text-[15px]">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3">
              <span>
                {l.name}
                {l.sizeName && `, ${l.sizeName}`} × {l.quantity}
              </span>
              <span className="font-semibold whitespace-nowrap">{formatPrice(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
        <span>Итого</span>
        <span>{formatPrice(total)}</span>
      </div>
      <MinOrderProgress total={total} />
      <Link
        href="/checkout"
        aria-disabled={lines.length === 0}
        className={`btn ${lines.length ? "btn-berry" : "pointer-events-none bg-fill text-muted"}`}
      >
        Оформить заказ
      </Link>
    </aside>
  );
}
