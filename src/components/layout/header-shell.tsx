"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const atTop = () => window.scrollY < 24;

// Страница с первым экраном PageHero (главная, банкеты) — у его секции атрибут data-hero-overlay.
// Прозрачность включается CSS-селектором по этому атрибуту, а не по пути страницы:
// usePathname() на маршрутах с параметрами, неизвестными при сборке (/order/[id]), доступен
// только во время запроса и без <Suspense> ломает пререндер (CLIENT_HOOK_DYNAMIC), а с Suspense
// в HTML попадает заглушка шапки, которая мелькает на главной перед прозрачной.
const OVERLAY = [
  "[body:has([data-hero-overlay])_&]:shadow-none",
  "[body:has([data-hero-overlay])_&]:before:opacity-0",
].join(" ");

// Подложка с размытием — на псевдоэлементе, а не на самой шапке: backdrop-filter у шапки
// сделал бы её контейнером для position: fixed, и мобильное меню (fixed) не растянулось бы на экран
const GLASS =
  "before:absolute before:inset-0 before:-z-10 before:bg-night/90 before:backdrop-blur-md before:transition-opacity before:duration-500";

/**
 * Обёртка шапки. На страницах с PageHero, пока страница не прокручена, шапка прозрачная
 * и лежит поверх фото первого экрана. При прокрутке и на остальных — тёмная.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  // На сервере считаем, что страница не прокручена
  const top = useSyncExternalStore(subscribe, atTop, () => true);

  return (
    <header
      className={`sticky top-0 z-40 isolate text-snow shadow-[0_18px_40px_-28px_rgb(0_0_0/0.8)] transition-shadow duration-500 ${GLASS} ${
        top ? OVERLAY : ""
      }`}
    >
      {children}
    </header>
  );
}
