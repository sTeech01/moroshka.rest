"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { gubkinskyNow, LUNCH_DAYS, type LunchDayKey, type LunchGroup } from "@/lib/business-lunch";
import type { BusinessLunchData } from "@/lib/content";
import { formatPrice } from "@/lib/format";

const SEEN_KEY = "moroshka:lunch-popup-seen";
const DEFAULT_INTRO = "Обед, который задаёт ритм дню";
// Фото шапки, если в админке у бизнес-ланча своё не загружено: «Уха по-северному» — плитка «Кухня» на главной
const DEFAULT_PHOTO = "/images/home/kitchen.webp";
// Длительность ухода окна — как у .lunch-dialog[data-state="closing"] в globals.css
const CLOSE_MS = 260;

/** Задержка появления элемента в каскаде (--d для .lunch-rise в globals.css) */
const rise = (ms: number) => ({ "--d": `${Math.min(ms, 380)}ms` }) as CSSProperties;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Окно «Бизнес-ланч сегодня» при первом за день входе на сайт.
 * Один раз в день на браузер, только если на сегодня есть меню и ещё не прошло «Показывать окно до».
 * Адрес страницы читается из window, а не usePathname(): хук в layout ломал пререндер (см. README).
 *
 * Анимации — в globals.css (.lunch-dialog): data-state="open" — появление каскадом,
 * "closing" — уход; сам dialog.close() (и размонтирование) — только после него.
 */
export function LunchPopup({ lunch }: { lunch: BusinessLunchData }) {
  const ref = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [day, setDay] = useState<LunchDayKey | null>(null);
  const [closing, setClosing] = useState(false);
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
    titleRef.current?.focus({ preventScroll: true });

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

  /** Плавное закрытие: сначала анимация ухода, потом dialog.close() → onClose размонтирует окно */
  const requestClose = useCallback(() => {
    const dialog = ref.current;
    if (!dialog?.open || dialog.dataset.state === "closing") return;
    if (reducedMotion()) return dialog.close();
    setClosing(true);
    window.setTimeout(() => dialog.close(), CLOSE_MS);
  }, []);

  if (!day) return null;
  const dayName = LUNCH_DAYS.find((d) => d.key === day)?.name;
  const photo = lunch.image?.url ?? DEFAULT_PHOTO;

  return (
    <dialog
      ref={ref}
      data-state={closing ? "closing" : "open"}
      onClose={() => {
        setDay(null);
        setClosing(false);
      }}
      // Esc: браузер закрыл бы окно мгновенно — перехватываем нажатие и закрываем с анимацией.
      // Только onCancel мало: без действий пользователя на странице Chrome не даёт отменить cancel
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        requestClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // Клик по затемнению вокруг окна закрывает его
      onClick={(e) => e.target === e.currentTarget && requestClose()}
      aria-labelledby="lunch-popup-title"
      aria-describedby="lunch-popup-intro"
      className="lunch-dialog m-auto flex-col overflow-hidden rounded-[28px] p-0 text-snow open:flex"
    >
      {/* Шапка-кадр: текст слева, фото уходит в хвойный фон */}
      <header className="relative isolate shrink-0 overflow-hidden">
        <div className="lunch-photo absolute inset-y-0 right-0 -z-20 w-full sm:w-[62%]" aria-hidden>
          <Image src={photo} alt="" fill sizes="(min-width: 640px) 600px, 100vw" className="object-cover object-[50%_42%]" />
        </div>
        <div className="lunch-photo-shade absolute inset-0 -z-10" aria-hidden />

        <button
          type="button"
          onClick={requestClose}
          className="group/close absolute top-3.5 right-3.5 z-10 grid h-11 w-11 place-items-center rounded-full bg-night/45 text-snow/80 ring-1 ring-snow/10 backdrop-blur-sm transition-[background-color,color,transform] duration-200 hover:bg-night/70 hover:text-snow active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry sm:top-5 sm:right-5"
          aria-label="Закрыть"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="transition-transform duration-300 ease-out group-hover/close:rotate-90"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* На невысоком экране (ноутбук) шапка ниже — больше места меню */}
        <div className="max-w-[34rem] px-6 pt-16 pb-6 sm:px-11 sm:pt-11 sm:pb-9 [@media(min-width:640px)_and_(max-height:780px)]:pt-8 [@media(min-width:640px)_and_(max-height:780px)]:pb-6">
          {/* На телефоне день и расписание — двумя строками, чтобы время не разрывалось переносом */}
          <p
            className="lunch-rise flex items-start gap-3 text-[11px] leading-[1.7] font-semibold tracking-[0.22em] text-berry uppercase sm:tracking-[0.26em]"
            style={rise(90)}
          >
            <span className="mt-[0.85em] h-px w-7 shrink-0 bg-berry/70" aria-hidden />
            <span>
              {dayName}
              <span className="hidden text-berry/45 sm:inline"> · </span>
              <span className="block text-berry/75 sm:inline sm:text-berry">{lunch.schedule}</span>
            </span>
          </p>
          <h2
            ref={titleRef}
            id="lunch-popup-title"
            tabIndex={-1}
            className="lunch-rise h-display mt-4 text-[2.6rem] tracking-[-0.01em] outline-none sm:text-[4.25rem] [@media(min-width:640px)_and_(max-height:780px)]:mt-3 [@media(min-width:640px)_and_(max-height:780px)]:text-[3.25rem]"
            style={rise(130)}
          >
            {lunch.title}
          </h2>
          <p
            id="lunch-popup-intro"
            className="lunch-rise mt-3 max-w-sm text-[15px] leading-relaxed text-snow/70 sm:text-base"
            style={rise(180)}
          >
            {lunch.intro || DEFAULT_INTRO}
          </p>
        </div>
      </header>

      {/* Меню: прокручивается только эта часть */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="mx-6 h-px bg-gradient-to-r from-snow/15 via-snow/[0.08] to-transparent sm:mx-11" aria-hidden />
        <div
          ref={scrollRef}
          onScroll={updateFade}
          tabIndex={0}
          aria-label={`Меню бизнес-ланча на ${dayName?.toLowerCase()}`}
          className="lunch-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-berry/50 sm:px-11 sm:pt-8 sm:pb-6"
        >
          <LunchColumns groups={lunch.week[day]} />
        </div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-px h-10 bg-gradient-to-b from-night to-transparent transition-opacity duration-300 ${fade.top ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-night to-transparent transition-opacity duration-300 ${fade.bottom ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Действия. За ними — фирменная гравюра морошки, едва заметно */}
      <footer
        className="lunch-rise relative isolate shrink-0 overflow-hidden border-t border-snow/[0.07] px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-11 sm:py-5"
        style={rise(380)}
      >
        <Image
          src="/images/berries.webp"
          alt=""
          aria-hidden
          width={2000}
          height={262}
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full object-cover object-top opacity-[0.05]"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
          {lunch.note && <p className="mr-auto hidden max-w-xs text-[13px] leading-snug text-lichen/70 lg:block">{lunch.note}</p>}
          <Link
            href="/business-lunch"
            onClick={requestClose}
            className="btn h-12 border border-snow/15 text-sm font-semibold text-snow/85 transition-[border-color,color,background-color] duration-200 hover:border-snow/35 hover:bg-snow/[0.04] hover:text-snow active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry sm:h-11 sm:px-6"
          >
            Меню на неделю
          </Link>
          <Link
            href="/#booking"
            onClick={requestClose}
            className="group/book btn btn-berry h-12 text-sm shadow-[0_10px_30px_-12px_rgb(242_160_58/0.6)] transition-[background-color,transform,box-shadow] duration-200 hover:shadow-[0_14px_34px_-12px_rgb(242_160_58/0.75)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow sm:h-11 sm:px-7"
          >
            Забронировать стол
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 ease-out group-hover/book:translate-x-1"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </footer>
    </dialog>
  );
}

/**
 * Категории в две колонки на широком экране с тонкой линией между ними: читаются сверху вниз,
 * затем во второй колонке, категория не разрывается. На телефоне — одна колонка.
 * Категории и блюда проявляются каскадом; наведение только подсвечивает строку — блюда не кликаются.
 */
function LunchColumns({ groups }: { groups: LunchGroup[] }) {
  let order = 0;
  return (
    <div className="md:columns-2 md:gap-16 md:[column-rule:1px_solid_rgb(239_232_220/0.06)]">
      {groups.map((g, gi) => {
        const groupDelay = 210 + gi * 35;
        return (
          <section key={gi} className="break-inside-avoid pb-8 last:pb-0">
            {g.title && (
              <h3 className="lunch-rise mb-2 flex items-baseline gap-3" style={rise(groupDelay)}>
                <span className="font-display text-[13px] text-berry tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                <span className="text-[11px] font-semibold tracking-[0.26em] text-snow/75 uppercase">{g.title}</span>
              </h3>
            )}
            <ul>
              {g.items.map((item, ii) => (
                <li
                  key={ii}
                  className="lunch-rise group/dish grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 border-b border-snow/[0.06] py-3 transition-colors duration-150 last:border-0 hover:border-snow/[0.16]"
                  style={rise(groupDelay + 25 + ++order * 12)}
                >
                  <span className="text-[15px] leading-snug text-pretty text-snow/85 transition-colors duration-150 group-hover/dish:text-snow">
                    {item.name}
                  </span>
                  <span className="flex items-baseline gap-3 whitespace-nowrap tabular-nums">
                    {item.weight && <span className="text-[12.5px] text-lichen/70">{item.weight}</span>}
                    <span className="min-w-[4.25rem] text-right text-[15px] font-semibold text-snow">{formatPrice(item.price)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
