"use client";

import { createContext, useContext } from "react";
import type { DeliverySettings } from "@/lib/delivery";

const DeliveryContext = createContext<DeliverySettings | null>(null);

/** Передаёт условия доставки из админки в клиентские компоненты (корзина, оформление) */
export function DeliveryProvider({ value, children }: { value: DeliverySettings; children: React.ReactNode }) {
  return <DeliveryContext value={value}>{children}</DeliveryContext>;
}

export function useDelivery(): DeliverySettings {
  const value = useContext(DeliveryContext);
  if (!value) throw new Error("useDelivery вне DeliveryProvider");
  return value;
}
