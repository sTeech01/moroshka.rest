import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Корзина", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="theme-paper">
      <div className="container-site pt-12 pb-24 lg:pt-16">
        <h1 className="h-display mb-10 text-5xl lg:text-7xl">Корзина</h1>
        <CartView />
      </div>
    </div>
  );
}
