"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Подтягивает корзину из localStorage после гидрации, чтобы не было расхождения с SSR */
export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
