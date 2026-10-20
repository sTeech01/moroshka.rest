import "server-only";

/** Telegram настроен: токен бота и чат ресторана */
export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

/** Отправляет сообщение (HTML-разметка Telegram) в чат ресторана */
export async function sendTelegram(html: string): Promise<void> {
  const tokenValue = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!tokenValue || !chatId) throw new Error("Telegram не настроен");

  const res = await fetch(`https://api.telegram.org/bot${tokenValue}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Telegram: ${res.status} ${await res.text()}`);
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
