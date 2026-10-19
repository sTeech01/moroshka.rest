"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { lineKey, type ModifierChoice } from "@/lib/cart/pricing";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  sizeId: string | null;
  sizeName: string | null;
  modifiers: { id: string; name: string; quantity: number }[];
  unitPrice: number;
  quantity: number;
};

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

type CartState = {
  lines: CartLine[];
  add: (line: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: ({ quantity = 1, ...line }) =>
        set((state) => {
          const choices: ModifierChoice[] = line.modifiers.map((m) => ({ id: m.id, quantity: m.quantity }));
          const key = lineKey(line.productId, line.sizeId, choices);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l)),
            };
          }
          return { lines: [...state.lines, { ...line, key, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 99) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "moroshka-cart", version: 1, skipHydration: true },
  ),
);

/** true, когда корзина уже загружена из localStorage */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}

export const cartTotal =(lines: CartLine[]) => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);
