import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Оформление заказа", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="theme-paper">
      <div className="container-site max-w-6xl pt-6 pb-16 lg:pt-8">
        <nav aria-label="Навигация" className="text-xs text-muted">
          <Link href="/cart" className="hover:text-text">
            Корзина
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span aria-current="page">Оформление заказа</span>
        </nav>
        <h1 className="h-display mt-3 mb-6 text-4xl lg:text-5xl">Оформление заказа</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
