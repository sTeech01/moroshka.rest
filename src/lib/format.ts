const rub = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export const formatPrice = (value: number) => rub.format(value);

/** Выход порции: «350 г» или для напитков «500 мл» */
export const formatWeight = (amount: number | null, unit?: string) =>
  amount ? `${amount} ${unit === "мл" || unit === "шт" ? "мл" : "г"}` : null;

const WEEKDAYS: Record<string, string> = {
  Пн: "Понедельник",
  Вт: "Вторник",
  Ср: "Среда",
  Чт: "Четверг",
  Пт: "Пятница",
  Сб: "Суббота",
  Вс: "Воскресенье",
};

/** «Пн–Сб» → «Понедельник — Суббота»: дни из настроек (часы работы) полными словами */
export const formatWeekdaysFull = (days: string) =>
  days
    .split(/\s*[–—-]\s*/)
    .map((d) => WEEKDAYS[d.trim()] ?? d.trim())
    .join(" — ");

/** «12:00–00:00» → «12:00 — 00:00» */
export const formatTimeRange = (time: string) => time.replace(/\s*[–—-]\s*/, " — ");
