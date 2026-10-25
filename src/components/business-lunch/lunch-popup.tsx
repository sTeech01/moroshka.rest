"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gubkinskyNow, LUNCH_DAYS, type LunchDayKey, type LunchGroup } from "@/lib/business-lunch";
import type { BusinessLunchData } from "@/lib/content";
import { formatPrice } from "@/lib/format";

const SEEN_KEY = "moroshka:lunch-popup-seen";
const DEFAULT_INTRO = "Обед, который задаёт ритм дню";

/**
 * Окно «Бизнес-ланч сегодня» при первом за день входе на сайт.
 * Один раз в день на браузер, только если на сегодня есть меню и ещё не прошло «Показывать окно до».
 * Адрес страницы читается из window, а не usePathname(): хук в layout ломал пререндер (см. README).
 * Шапка и кнопки на месте, прокручивается только меню; стили окна — .lunch-dialog в globals.css.
 */
export function LunchPopup({ lunch }: { lunch: BusinessLunchData }) {
  const ref = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [day, setDay] = useState<LunchDayKey | null>(null);
  // Тени у краёв меню: есть ли ещё блюда выше / ниже видимой части
  const [fade, setFade] = useState({ top: false, bottom: false });

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

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFade({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 });
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!day || !dialog) return;
    if (!dialog.open) dialog.showModal();
    // Фокус при открытии — на заголовок, а не на крестик (его браузер выбрал бы первым):
    // диктор сразу читает название, а вокруг кнопки не загорается кольцо фокуса
    titleRef.current?.focus();

    // Страница под окном не прокручивается; ширину полосы прокрутки возмещаем отступом, чтобы вёрстка не прыгала
    const html = document.documentElement;
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    const gap = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (gap > 0) html.style.paddingRight = `${gap}px`;

    const raf = requestAnimationFrame(updateFade);
    window.addEventListener("resize", updateFade);
    return () => {
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.paddingRight;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateFade);
    };
  }, [day, updateFade]);

  if (!day) return null;
  const close = () => ref.current?.close();
  const dayName = LUNCH_DAYS.find((d) => d.key === day)?.name;

  return (
    <dialog
      ref={ref}
      onClose={() => setDay(null)}
      // Клик по затемнению вокруг окна закрывает его
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby="lunch-popup-title"
      aria-describedby="lunch-popup-intro"
      className="lunch-dialog m-auto flex-col overflow-hidden rounded-2xl border border-snow/10 p-0 text-snow open:flex"
    >
      {/* Шапка */}
      <header className="relative shrink-0 px-6 pt-6 pb-5 sm:px-10 sm:pt-9 sm:pb-7">
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-full text-lichen transition-colors hover:bg-snow/[0.06] hover:text-snow focus-visible:outline-2 focus-visible:outline-berry sm:top-5 sm:right-5"
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <p className="pr-12 text-[11px] tracking-[0.28em] text-berry uppercase">
          {dayName} <span className="text-berry/50">·</span> {lunch.schedule}
        </p>
        <h2 ref={titleRef} id="lunch-popup-title" tabIndex={-1} className="h-display mt-2.5 text-[2.25rem] outline-none sm:mt-3 sm:text-6xl">
          {lunch.title}
        </h2>
        <p id="lunch-popup-intro" className="mt-2 max-w-xl text-[15px] leading-relaxed text-lichen sm:mt-3 sm:text-base">
          {lunch.intro || DEFAULT_INTRO}
        </p>
      </header>

      {/* Меню: прокручивается только эта часть */}
      <div className="relative flex min-h-0 flex-1 flex-col border-y border-snow/[0.08]">
        <div
          ref={scrollRef}
          onScroll={updateFade}
          tabIndex={0}
          aria-label={`Меню бизнес-ланча на ${dayName?.toLowerCase()}`}
          className="lunch-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-berry/60 sm:px-10 sm:py-8"
        >
          <LunchColumns groups={lunch.week[day]} />
        </div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-night to-transparent transition-opacity duration-200 ${fade.top ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-night to-transparent transition-opacity duration-200 ${fade.bottom ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Действия: на телефоне главная кнопка сверху, на компьютере — справа */}
      <footer className="flex shrink-0 flex-col-reverse gap-2 px-6 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-10 sm:py-5">
        <Link
          href="/business-lunch"
          onClick={close}
          className="btn h-11 border border-snow/15 text-sm font-semibold text-snow/85 hover:border-berry/60 hover:text-berry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry"
        >
          Меню на неделю
        </Link>
        <Link
          href="/#booking"
          onClick={close}
          className="btn btn-berry h-11 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow sm:px-8"
        >
          Забронировать стол
        </Link>
      </footer>
    </dialog>
  );
}

/**
 * Категории в две колонки на широком экране: читаются сверху вниз, затем во второй колонке,
 * категория не разрывается между колонками. На телефоне — одна колонка.
 */
function LunchColumns({ groups }: { groups: LunchGroup[] }) {
  return (
    <div className="md:columns-2 md:gap-14">
      {groups.map((g, gi) => (
        <section key={gi} className="break-inside-avoid pb-7 last:pb-0 md:pb-8">
          {g.title && (
            <h3 className="mb-1.5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-berry/90 uppercase">
              {g.title}
              <span className="h-px flex-1 bg-snow/[0.08]" aria-hidden />
            </h3>
          )}
          <ul>
            {g.items.map((item, ii) => (
              <li
                key={ii}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 border-b border-snow/[0.06] py-3 last:border-0"
              >
                <span className="text-[15px] leading-snug text-pretty text-snow/90">{item.name}</span>
                <span className="flex items-baseline gap-3 whitespace-nowrap tabular-nums">
                  {item.weight && <span className="text-[13px] text-lichen/75">{item.weight}</span>}
                  <span className="min-w-[4.25rem] text-right text-[15px] font-semibold text-snow">{formatPrice(item.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
