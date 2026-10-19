import "server-only";

/**
 * Отправляет сообщение в Telegram-чат ресторана.
 * Без TELEGRAM_BOT_TOKEN пишет в консоль: удобно для локальной разработки.
 */
export async function sendTelegram(html: string): Promise<void> {
  const tokenValue = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!tokenValue || !chatId) {
    if (process.env.NODE_ENV === "production") throw new Error("Telegram не настроен");
    console.info("[telegram:dev]\n" + html.replace(/<[^>]+>/g, ""));
    return;
  }

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
