import "server-only";
import { randomInt } from "node:crypto";

/** ВК настроен: токен сообщества и номер беседы сотрудников */
export const vkConfigured = () => Boolean(process.env.VK_GROUP_TOKEN && process.env.VK_CHAT_ID);

/**
 * Сообщение в беседу сотрудников ВКонтакте от имени сообщества (messages.send).
 * VK_CHAT_ID — номер беседы у сообщества (2) или готовый peer_id (2000000002).
 * Токен сообщества нужен с правом «Сообщения сообщества», бот должен быть добавлен в беседу.
 */
export async function sendVk(text: string): Promise<void> {
  const token = process.env.VK_GROUP_TOKEN;
  const chat = Number(process.env.VK_CHAT_ID);
  if (!token || !chat) throw new Error("ВКонтакте не настроен");

  const body = new URLSearchParams({
    peer_id: String(chat < 2_000_000_000 ? 2_000_000_000 + chat : chat),
    // ВК не принимает сообщения длиннее 4096 символов
    message: text.length > 4096 ? text.slice(0, 4093) + "…" : text,
    // Защита от дублей при повторной отправке — у каждого сообщения свой
    random_id: String(randomInt(1, 2_147_483_647)),
    access_token: token,
    v: "5.199",
  });

  const res = await fetch("https://api.vk.com/method/messages.send", { method: "POST", body, cache: "no-store" });
  const data = (await res.json().catch(() => null)) as { response?: number; error?: { error_code: number; error_msg: string } } | null;
  if (!res.ok || !data || data.error || data.response === undefined) {
    throw new Error(`ВКонтакте: ${data?.error ? `${data.error.error_code} ${data.error.error_msg}` : res.status}`);
  }
}
