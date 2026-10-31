"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Круглая кнопка «назад»: возвращает туда, откуда пришли (в меню или в самовывоз — на то же место
 * прокрутки), а если страницу открыли по прямой ссылке — ведёт на fallback.
 */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      onClick={(e) => {
        if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
          e.preventDefault();
          router.back();
        }
      }}
      className="grid h-11 w-11 place-items-center rounded-full bg-card text-text ring-1 ring-border ring-inset transition-colors hover:text-berry"
      aria-label="Назад"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </Link>
  );
}
