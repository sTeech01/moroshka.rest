import "server-only";
import { sendTelegram, telegramConfigured } from "./telegram";
import { sendVk, vkConfigured } from "./vk";

export { escapeHtml } from "./telegram";

/** Демо на Vercel без каналов уведомлений: заявки принимаются, но никуда не уходят */
export const isDemo = () => Boolean(process.env.VERCEL) && !telegramConfigured() && !vkConfigured();

/** HTML-разметка Telegram → обычный текст для ВК и консоли */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Уведомление сотрудникам ресторана (заказ, бронь, заявка на банкет).
 * Уходит во все настроенные каналы: Telegram (TELEGRAM_*) и беседу ВКонтакте (VK_*).
 * Считается отправленным, если дошло хотя бы до одного; ошибки каналов пишутся в лог.
 * Без настроенных каналов: в разработке и на демо (Vercel) — только в лог, заявка «принимается»;
 * на боевом сервере — ошибка, чтобы клиент не увидел «Заказ принят» при заказе, который никуда не ушёл.
 */
export async function notifyStaff(html: string): Promise<void> {
  const channels: { name: string; send: () => Promise<void> }[] = [];
  if (telegramConfigured()) channels.push({ name: "telegram", send: () => sendTelegram(html) });
  if (vkConfigured()) channels.push({ name: "vk", send: () => sendVk(toPlainText(html)) });

  if (channels.length === 0) {
    if (process.env.NODE_ENV === "production" && !isDemo()) {
      throw new Error("Не настроен ни один канал уведомлений (Telegram или ВКонтакте)");
    }
    console.info(`[notify:${isDemo() ? "demo" : "dev"}] не отправлено — каналы не настроены\n` + toPlainText(html));
    return;
  }

  const results = await Promise.allSettled(channels.map((c) => c.send()));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[notify] ${channels[i].name} не доставлено`, r.reason);
  });
  if (results.every((r) => r.status === "rejected")) throw new Error("Уведомление не доставлено ни в один канал");
}
