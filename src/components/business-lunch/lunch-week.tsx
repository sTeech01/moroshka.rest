"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { gubkinskyNow, LUNCH_DAYS, type LunchDayKey, type LunchWeek } from "@/lib/business-lunch";
import { LunchGroups } from "./lunch-groups";

const noSubscribe = () => () => {};

/**
 * Меню по дням на странице /business-lunch: дни недели — под заголовком страницы (head),
 * меню выбранного дня — в карточке, под ним — сноска и кнопки (footer). Страница кэшируется,
 * поэтому «сегодня» выбирается уже в браузере, по времени Губкинского; на сервере — первый день с меню.
 */
export function LunchWeekMenu({ week, head, footer }: { week: LunchWeek; head: ReactNode; footer: ReactNode }) {
  const days = LUNCH_DAYS.filter((d) => week[d.key].length > 0);
  const today = useSyncExternalStore<LunchDayKey | null>(noSubscribe, () => gubkinskyNow().day, () => null);
  const [picked, setActive] = useState<LunchDayKey | null>(null);
  const active = picked ?? (today && week[today].length ? today : (days[0]?.key ?? null));

  return (
    <>
      <div className="container-site">
        {head}
        {active && days.length > 1 && (
          <div role="tablist" aria-label="День недели" className="mt-8 flex flex-wrap gap-2 lg:mt-10">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={d.key === active}
                aria-label={`${d.name}${d.key === today ? ", сегодня" : ""}`}
                onClick={() => setActive(d.key)}
                className={`relative h-10 min-w-12 rounded-full px-4 text-sm ring-1 ring-inset backdrop-blur-sm transition-[background-color,color,box-shadow] duration-200 ${
                  d.key === active ? "bg-berry font-semibold text-night ring-berry" : "bg-night/35 text-snow ring-snow/20 hover:ring-berry/70"
                }`}
              >
                {d.short}
                {d.key === today && (
                  <span aria-hidden className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container-site mt-10 lg:mt-12">
        <div className="lunch-card rounded-[28px] px-5 py-10 sm:px-12 sm:py-12 lg:px-20 lg:py-16">
          <div className="mx-auto max-w-[880px]">
            {active ? (
              <LunchGroups groups={week[active]} />
            ) : (
              <p className="text-center text-lichen">Меню бизнес-ланча скоро появится.</p>
            )}
            {footer}
          </div>
        </div>
      </div>
    </>
  );
}
