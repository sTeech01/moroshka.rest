import { randomUUID } from "node:crypto";
import { formatPrice } from "@/lib/format";
import { escapeHtml, sendTelegram } from "@/lib/notify/telegram";
import type { OrderInput, OrderSink } from "../types";

const paymentLabels = { cash: "Наличными курьеру", card: "Картой курьеру", online: "Онлайн" } as const;

function orderNumber(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function render(order: OrderInput, number: string): string {
  const e = escapeHtml;
  const lines = order.lines
    .map((l) => {
      const size = l.sizeName ? ` (${e(l.sizeName)})` : "";
      const mods = l.modifiers.map((m) => `\n    + ${e(m.name)}${m.quantity > 1 ? ` ×${m.quantity}` : ""}`).join("");
      return `• ${e(l.name)}${size} × ${l.quantity} — ${formatPrice(l.unitPrice * l.quantity)}${mods}`;
    })
    .join("\n");

  const a = order.address;
  const where =
    order.serviceType === "pickup"
      ? "🏃 <b>Самовывоз</b>"
      : `🚗 <b>Доставка:</b> ${e(`${a?.city}, ${a?.street}, д. ${a?.house}`)}` +
        (a?.flat ? `, кв. ${e(a.flat)}` : "") +
        (a?.entrance ? `, подъезд ${e(a.entrance)}` : "") +
        (a?.floor ? `, этаж ${e(a.floor)}` : "");

  const when = order.deliverAt
    ? new Date(order.deliverAt).toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg", dateStyle: "short", timeStyle: "short" })
    : "Как можно скорее";

  return [
    `🧾 <b>Заказ №${number}</b>`,
    "",
    `👤 ${e(order.customer.name)}, ${e(order.customer.phone)}`,
    where,
    `🕒 ${when}`,
    `💳 ${paymentLabels[order.payment]}`,
    order.comment ? `💬 ${e(order.comment)}` : null,
    "",
    lines,
    "",
    `Товары: ${formatPrice(order.itemsSum)}`,
    order.serviceType === "delivery" ? `Доставка: ${formatPrice(order.deliveryPrice)}` : null,
    `<b>Итого: ${formatPrice(order.total)}</b>`,
  ]
    .filter((x) => x !== null)
    .join("\n");
}

/** Заказы уходят сообщением в Telegram-чат ресторана. Используется до подключения iiko */
export const telegramOrderSink: OrderSink = {
  async createOrder(order) {
    const number = orderNumber();
    await sendTelegram(render(order, number));
    return { id: randomUUID(), number };
  },
  // Статусы в Telegram-режиме не отслеживаются
  async getOrderStatus() {
    return "accepted";
  },
};
