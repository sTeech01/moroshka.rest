"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const atTop = () => window.scrollY < 24;

/**
 * Обёртка шапки. Сама шапка прозрачная, тёмная подложка — у панели .header-bar внутри (globals.css):
 * на компьютере это плавающая панель шириной с контент, на телефоне — во всю ширину.
 * На страницах с PageHero (у секции атрибут data-hero-overlay), пока страница не прокручена,
 * подложка скрыта и шапка лежит поверх фото первого экрана; при прокрутке и на остальных — тёмная.
 * Прозрачность — CSS-селектором по атрибутам data-top и data-hero-overlay, а не по пути страницы:
 * usePathname() на маршрутах с параметрами, неизвестными при сборке (/order/[id]), доступен
 * только во время запроса и без <Suspense> ломает пререндер (CLIENT_HOOK_DYNAMIC), а с Suspense
 * в HTML попадает заглушка шапки, которая мелькает на главной перед прозрачной.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  // На сервере считаем, что страница не прокручена
  const top = useSyncExternalStore(subscribe, atTop, () => true);

  return (
    <header data-top={top ? "" : undefined} className="site-header sticky top-0 z-40 text-snow">
      {children}
    </header>
  );
}
