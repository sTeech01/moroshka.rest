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
  "[body:has([data-hero-overlay])_&]:border-transparent",
  "[body:has([data-hero-overlay])_&]:bg-transparent",
  "[body:has([data-hero-overlay])_&]:backdrop-blur-none",
].join(" ");

/**
 * Обёртка шапки. На страницах с PageHero, пока страница не прокручена, шапка прозрачная
 * и лежит поверх фото первого экрана. При прокрутке и на остальных — тёмная.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  // На сервере считаем, что страница не прокручена
  const top = useSyncExternalStore(subscribe, atTop, () => true);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#2a3a33] bg-night/95 text-snow backdrop-blur transition-colors duration-300 ${
        top ? OVERLAY : ""
      }`}
    >
      {children}
    </header>
  );
}
