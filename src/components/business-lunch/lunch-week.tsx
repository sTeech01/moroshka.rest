"use client";

import { useState, useSyncExternalStore } from "react";
import { gubkinskyNow, LUNCH_DAYS, type LunchDayKey, type LunchWeek } from "@/lib/business-lunch";
import { LunchGroups } from "./lunch-groups";

const noSubscribe = () => () => {};

/**
 * Меню по дням на странице /business-lunch. Страница кэшируется, поэтому «сегодня»
 * выбирается уже в браузере, по времени Губкинского; на сервере — первый день с меню.
 */
export function LunchWeekMenu({ week }: { week: LunchWeek }) {
  const days = LUNCH_DAYS.filter((d) => week[d.key].length > 0);
  const today = useSyncExternalStore<LunchDayKey | null>(noSubscribe, () => gubkinskyNow().day, () => null);
  const [picked, setActive] = useState<LunchDayKey | null>(null);
  const active = picked ?? (today && week[today].length ? today : (days[0]?.key ?? null));

  if (!active) return <p className="mt-10 text-center text-soft">Меню бизнес-ланча скоро появится.</p>;

  return (
    <div className="mt-10">
      {days.length > 1 && (
        <div role="tablist" aria-label="День недели" className="mb-8 flex flex-wrap justify-center gap-2">
          {days.map((d) => (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={d.key === active}
              onClick={() => setActive(d.key)}
              className={`rounded-full px-4 py-2 text-sm ring-1 ring-inset transition-[background-color,color,box-shadow] duration-200 ${
                d.key === active ? "bg-berry text-night ring-berry" : "bg-card ring-border hover:ring-berry"
              }`}
            >
              {d.short}
              {d.key === today && <span className="ml-1.5 text-xs opacity-80">сегодня</span>}
            </button>
          ))}
        </div>
      )}
      <p className="mb-6 text-center text-lg font-semibold">
        {LUNCH_DAYS.find((d) => d.key === active)?.name}
        {active === today && <span className="font-normal text-muted"> — сегодня</span>}
      </p>
      <LunchGroups groups={week[active]} />
    </div>
  );
}
