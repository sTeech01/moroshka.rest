"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gubkinskyNow, LUNCH_DAYS, type LunchDayKey } from "@/lib/business-lunch";
import type { BusinessLunchData } from "@/lib/content";
import { LunchGroups } from "./lunch-groups";

const SEEN_KEY = "moroshka:lunch-popup-seen";

/**
 * Окно «Бизнес-ланч сегодня» при первом за день входе на сайт.
 * Один раз в день на браузер, только если на сегодня есть меню и ещё не прошло «Показывать окно до».
 * Адрес страницы читается из window, а не usePathname(): хук в layout ломал пререндер (см. README).
 */
export function LunchPopup({ lunch }: { lunch: BusinessLunchData }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [day, setDay] = useState<LunchDayKey | null>(null);

  useEffect(() => {
    if (!lunch.enabled || !lunch.popupEnabled) return;
    if (window.location.pathname.startsWith("/business-lunch")) return;
    const now = gubkinskyNow();
    if (!lunch.week[now.day].length) return;
    if (lunch.popupUntil && now.time >= lunch.popupUntil) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === now.date) return;
      localStorage.setItem(SEEN_KEY, now.date);
    } catch {
      // Хранилище недоступно (приватный режим) — окно покажется, просто без запоминания
    }
    // Небольшая пауза, чтобы гость сначала увидел первый экран
    const t = window.setTimeout(() => setDay(now.day), 1200);
    return () => window.clearTimeout(t);
  }, [lunch]);

  useEffect(() => {
    if (day && !ref.current?.open) ref.current?.showModal();
  }, [day]);

  if (!day) return null;
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      onClose={() => setDay(null)}
      // Клик по затемнению вокруг окна закрывает его
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby="lunch-popup-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-night p-0 text-snow backdrop:bg-black/70"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-4">
          <div>
            <p className="eyebrow text-berry">
              Сегодня, {LUNCH_DAYS.find((d) => d.key === day)?.name.toLowerCase()} · {lunch.schedule}
            </p>
            <h2 id="lunch-popup-title" className="h-display mt-2 text-3xl">
              {lunch.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border hover:border-berry"
            aria-label="Закрыть"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <LunchGroups groups={lunch.week[day]} compact />
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row">
          <Link href="/#booking" onClick={close} className="btn btn-berry flex-1">
            Забронировать стол
          </Link>
          <Link href="/business-lunch" onClick={close} className="btn btn-line flex-1">
            Меню на неделю
          </Link>
        </div>
      </div>
    </dialog>
  );
}
