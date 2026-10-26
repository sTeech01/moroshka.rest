"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDelivery } from "@/components/delivery-context";
import { features } from "@/config/site";
import { deliveryPriceFor, PICKUP_LEAD_MINUTES, type DeliverySettings } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import type { CheckoutPayload } from "@/lib/order/schema";
import { cartTotal, useCart, useCartHydrated } from "@/store/cart";
import { StreetInput } from "./street-input";

type Slot = { value: string; label: string };

/** "23:30" → Date на сегодня; "00:00" в конце окна — полночь следующего дня */
function todayAt(hhmm: string, endOfWindow = false): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (endOfWindow && h === 0 && m === 0) d.setDate(d.getDate() + 1);
  return d;
}

/** Слоты «ко времени» на сегодня в окне приёма заказов из админки. Самовывоз готов быстрее доставки */
function buildSlots(d: DeliverySettings, pickup: boolean): Slot[] {
  const step = d.slotMinutes * 60_000;
  const lead = pickup ? PICKUP_LEAD_MINUTES : d.leadTimeMinutes;
  const earliest = Math.max(Date.now() + lead * 60_000, todayAt(d.acceptFrom).getTime());
  const start = Math.ceil(earliest / step) * step;
  const end = todayAt(d.acceptUntil, true);
  const slots: Slot[] = [];
  for (let t = start; t <= end.getTime(); t += step) {
    const d = new Date(t);
    slots.push({ value: d.toISOString(), label: d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) });
  }
  return slots;
}

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const icons = {
  truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  store: "M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
};

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const { lines, clear } = useCart();
  const total = cartTotal(lines);
  const delivery = useDelivery();

  const [serviceType, setServiceType] = useState<"delivery" | "pickup">(delivery.enabled ? "delivery" : "pickup");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const deliveryPrice = serviceType === "delivery" ? deliveryPriceFor(delivery, total) : 0;
  const belowMin = serviceType === "delivery" && total < delivery.minOrderSum;
  const isDelivery = serviceType === "delivery";

  if (!hydrated) return <div className="skeleton h-96 rounded-card" />;
  if (lines.length === 0) {
    return (
      <p>
        Корзина пуста.{" "}
        <Link href="/delivery" className="underline">
          Выбрать блюда
        </Link>
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const str = (k: string) => (f.get(k) as string | null)?.trim() || undefined;

    const payload: CheckoutPayload = {
      serviceType,
      name: str("name") ?? "",
      phone: str("phone") ?? "",
      street: str("street"),
      house: str("house"),
      flat: str("flat"),
      entrance: str("entrance"),
      floor: str("floor"),
      deliverAt: str("deliverAt") ?? null,
      comment: str("comment"),
      payment: (str("payment") ?? "cash") as CheckoutPayload["payment"],
      consent: f.get("consent") === "on",
      website: str("website"),
      lines: lines.map((l) => ({
        productId: l.productId,
        sizeId: l.sizeId,
        quantity: l.quantity,
        modifiers: l.modifiers.map((m) => ({ id: m.id, quantity: m.quantity })),
      })),
    };

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не удалось оформить заказ");

      clear();
      if (data.redirectUrl) window.location.href = data.redirectUrl;
      else router.push(`/order/${data.id}?n=${encodeURIComponent(data.number)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось оформить заказ");
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div className="space-y-6">
        <fieldset>
          <legend className="form-section-title">Способ получения</legend>
          <div className="flex flex-wrap gap-2">
            {delivery.enabled && (
              <button type="button" onClick={() => setServiceType("delivery")} aria-pressed={isDelivery} className="pill pill-compact">
                <Icon d={icons.truck} /> Доставка
              </button>
            )}
            {delivery.pickupEnabled && (
              <button type="button" onClick={() => setServiceType("pickup")} aria-pressed={!isDelivery} className="pill pill-compact">
                <Icon d={icons.store} /> Самовывоз
              </button>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="form-section-title">Контактные данные</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="co-name" className="label-compact">Имя</label>
              <input id="co-name" name="name" className="field field-compact" placeholder="Введите имя" autoComplete="given-name" required minLength={2} />
            </div>
            <div>
              <label htmlFor="co-phone" className="label-compact">Телефон</label>
              <input id="co-phone" name="phone" className="field field-compact" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
          </div>
        </fieldset>

        {isDelivery ? (
          <fieldset>
            <legend className="form-section-title">Адрес доставки</legend>
            <div className="grid gap-3 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <span className="label-compact">Город</span>
                <div className="field field-compact flex items-center bg-fill/60" aria-label="Город доставки">
                  {delivery.city}
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="co-street" className="label-compact">Улица</label>
                <StreetInput id="co-street" className="field field-compact" placeholder="Введите улицу или микрорайон" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-house" className="label-compact">Дом</label>
                <input id="co-house" name="house" className="field field-compact" placeholder="Например, 12" required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-flat" className="label-compact">Квартира</label>
                <input id="co-flat" name="flat" className="field field-compact" placeholder="Например, 45" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-entrance" className="label-compact">Подъезд</label>
                <input id="co-entrance" name="entrance" className="field field-compact" placeholder="Например, 2" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-floor" className="label-compact">Этаж</label>
                <input id="co-floor" name="floor" className="field field-compact" placeholder="Например, 5" />
              </div>
            </div>
          </fieldset>
        ) : (
          <div className="rounded-soft bg-fill/60 px-4 py-3 text-sm">
            Самовывоз из ресторана. Заказ обычно готов через {PICKUP_LEAD_MINUTES} минут.
          </div>
        )}

        <fieldset>
          <legend className="form-section-title">{isDelivery ? "Время доставки" : "Время самовывоза"}</legend>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setSlots(null)} aria-pressed={slots === null} className="pill pill-compact">
              <Icon d={icons.clock} /> Как можно скорее
            </button>
            <button type="button" onClick={() => setSlots(buildSlots(delivery, !isDelivery))} aria-pressed={slots !== null} className="pill pill-compact">
              <Icon d={icons.calendar} /> Ко времени
            </button>
            {slots !== null &&
              (slots.length > 0 ? (
                <select name="deliverAt" className="field field-compact w-auto min-w-28" required aria-label="Время">
                  {slots.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-muted">На сегодня свободного времени уже нет</span>
              ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="form-section-title">Способ оплаты</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              { value: "cash", label: isDelivery ? "Наличными курьеру" : "Наличными в ресторане", show: true },
              { value: "card", label: isDelivery ? "Картой курьеру" : "Картой в ресторане", show: true },
              { value: "online", label: "Онлайн", show: features.onlinePayment },
            ]
              .filter((p) => p.show)
              .map((p, i) => (
                <label key={p.value} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="payment" value={p.value} defaultChecked={i === 0} className="accent-berry" />
                  {p.label}
                </label>
              ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="co-comment" className="form-section-title block">Комментарий к заказу</label>
          <textarea
            id="co-comment"
            name="comment"
            className="field field-compact"
            rows={2}
            maxLength={500}
            placeholder={isDelivery ? "Например, уточните удобное время, особенности подъезда и т. д." : "Например, нужны приборы или особые пожелания к блюдам"}
          />
        </div>

        {/* Ловушка для ботов */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <label className="flex items-start gap-2.5 text-[13px] text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-berry" />
          <span>
            Согласен с{" "}
            <Link href="/privacy-policy" className="text-text underline">
              обработкой персональных данных
            </Link>{" "}
            и{" "}
            <Link href="/offer" className="text-text underline">
              условиями оферты
            </Link>
          </span>
        </label>
      </div>

      <aside className="card-soft space-y-3 p-6 lg:sticky lg:top-28">
        <h2 className="h-display text-2xl">Ваш заказ</h2>
        <div className="flex justify-between text-sm">
          <span>Товары</span>
          <span>{formatPrice(total)}</span>
        </div>
        {isDelivery && (
          <div className="flex justify-between text-sm">
            <span>Доставка</span>
            <span>{deliveryPrice ? formatPrice(deliveryPrice) : "Бесплатно"}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-2">
          <span className="h-display text-xl">Итого</span>
          <span className="text-xl font-bold">{formatPrice(total + deliveryPrice)}</span>
        </div>

        {isDelivery && delivery.deliveryTimeText && (
          <p className="text-xs text-muted">Время доставки: {delivery.deliveryTimeText}</p>
        )}
        {delivery.notice && <p className="text-xs font-semibold">{delivery.notice}</p>}
        {belowMin && (
          <p className="text-sm text-danger">Минимальный заказ на доставку — {formatPrice(delivery.minOrderSum)}</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" className="btn btn-berry w-full" disabled={sending || belowMin}>
          {sending ? "Отправляем…" : "Подтвердить заказ"}
        </button>
      </aside>
    </form>
  );
}
