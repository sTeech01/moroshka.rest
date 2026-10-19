"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const atTop = () => window.scrollY < 24;

/** Страницы с первым экраном PageHero — на них шапка прозрачная поверх фото, пока не прокрутили */
const OVERLAY_PATHS = ["/", "/banquets"];

/**
 * Обёртка шапки. На страницах с PageHero (главная, банкеты), пока страница не прокручена,
 * шапка прозрачная и лежит поверх фото первого экрана. При прокрутке и на остальных — тёмная.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // На сервере считаем, что страница не прокручена
  const top = useSyncExternalStore(subscribe, atTop, () => true);
  const overlay = OVERLAY_PATHS.includes(pathname) && top;

  return (
    <header
      className={`sticky top-0 z-40 border-b text-snow transition-colors duration-300 ${
        overlay ? "border-transparent bg-transparent" : "border-[#2a3a33] bg-night/95 backdrop-blur"
      }`}
    >
      {children}
    </header>
  );
}
