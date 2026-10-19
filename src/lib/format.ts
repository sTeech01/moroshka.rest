const rub = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export const formatPrice = (value: number) => rub.format(value);

/** Выход порции: «350 г» или для напитков «500 мл» */
export const formatWeight = (amount: number | null, unit?: string) =>
  amount ? `${amount} ${unit === "мл" || unit === "шт" ? "мл" : "г"}` : null;
