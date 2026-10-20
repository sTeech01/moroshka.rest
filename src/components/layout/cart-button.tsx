"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { formatPrice } from "@/lib/format";
import { cartCount, cartTotal, useCart } from "@/store/cart";

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M6 7h12l-1 13H7L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

export function CartButton() {
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);

  return (
    <Link
      href="/cart"
      className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-berry px-3 text-sm font-bold text-night hover:bg-berry-hover"
      aria-label={count ? `Корзина: ${count} шт. на ${formatPrice(cartTotal(lines))}` : "Корзина"}
    >
      <BagIcon />
      {count > 0 && <span className="pr-1">{formatPrice(cartTotal(lines))}</span>}
    </Link>
  );
}

/**
 * Плавающая кнопка корзины на телефоне. Скрыта в самой корзине и при оформлении.
 * usePathname() — в Suspense: на /order/[id] путь известен только во время запроса (см. HeaderShell).
 * Заглушка пустая — кнопка и так не рендерится на сервере: корзина пуста до загрузки из localStorage.
 */
export function FloatingCart() {
  return (
    <Suspense fallback={null}>
      <FloatingCartByPath />
    </Suspense>
  );
}

function FloatingCartByPath() {
  const lines = useCart((s) => s.lines);
  const pathname = usePathname();
  const count = cartCount(lines);
  if (count === 0 || pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <Link
      href="/cart"
      className="btn btn-berry fixed inset-x-4 bottom-4 z-40 h-14 justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:hidden"
    >
      <span>Корзина · {count}</span>
      <span>{formatPrice(cartTotal(lines))}</span>
    </Link>
  );
}
