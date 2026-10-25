// Бизнес-ланч по дням недели — общее для CMS, сервера и браузера (без server-only).

export const LUNCH_DAYS = [
  { key: "mon", short: "Пн", name: "Понедельник", accusative: "понедельник" },
  { key: "tue", short: "Вт", name: "Вторник", accusative: "вторник" },
  { key: "wed", short: "Ср", name: "Среда", accusative: "среду" },
  { key: "thu", short: "Чт", name: "Четверг", accusative: "четверг" },
  { key: "fri", short: "Пт", name: "Пятница", accusative: "пятницу" },
  { key: "sat", short: "Сб", name: "Суббота", accusative: "субботу" },
  { key: "sun", short: "Вс", name: "Воскресенье", accusative: "воскресенье" },
] as const;

export type LunchDayKey = (typeof LUNCH_DAYS)[number]["key"];

export type LunchGroup = { title: string | null; items: { name: string; weight: string | null; price: number }[] };

/** Меню по дням: свои разделы дня + общие («каждый день») в конце. Пустой массив — в этот день ланча нет */
export type LunchWeek = Record<LunchDayKey, LunchGroup[]>;

const WEEKDAYS: LunchDayKey[] = ["mon", "tue", "wed", "thu", "fri"];

/**
 * Собирает меню недели из CMS. Пока ни у одного дня нет своего меню (как до появления дней),
 * общий список считается меню на все будни — сайт не теряет уже заполненный ланч.
 */
export function buildLunchWeek(common: LunchGroup[], days: Partial<Record<LunchDayKey, LunchGroup[]>>): LunchWeek {
  const anyDay = LUNCH_DAYS.some((d) => (days[d.key] ?? []).length > 0);
  const week = {} as LunchWeek;
  for (const { key } of LUNCH_DAYS) {
    const own = days[key] ?? [];
    if (anyDay) week[key] = own.length ? [...own, ...common] : [];
    else week[key] = WEEKDAYS.includes(key) ? common : [];
  }
  return week;
}

// Губкинский живёт по Екатеринбургу (UTC+5), а гость может открыть сайт с телефона в другом поясе
const TIME_ZONE = "Asia/Yekaterinburg";
const WEEKDAY_KEYS: Record<string, LunchDayKey> = {
  Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
};

/** День недели, дата (ГГГГ-ММ-ДД) и время (ЧЧ:ММ) в Губкинском */
export function gubkinskyNow(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    day: WEEKDAY_KEYS[parts.weekday],
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}
