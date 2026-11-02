"use client";

import { useDelivery } from "@/components/delivery-context";
import { PICKUP_LEAD_MINUTES } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

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
      <div className="h-1.5 overflow-hidden rounded-full bg-fill">
        <div className="h-1.5 rounded-full bg-berry transition-[width] duration-500" style={{ width: `${Math.min(100, (total / Math.max(d.minOrderSum, 1)) * 100)}%` }} />
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

