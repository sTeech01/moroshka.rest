const TZ = "Asia/Yekaterinburg";

/**
 * Дата события по времени Губкинского (UTC+5): «14 ноября · 19:00».
 * Время 00:00 означает «весь день» (например, запуск меню) — тогда только «23 октября».
 */
export const formatEventDate = (date: string) => {
  const d = new Date(date);
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const day = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });
  return time === "00:00" ? day : `${day} · ${time}`;
};
