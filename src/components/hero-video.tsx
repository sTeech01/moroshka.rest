"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
type Connection = { saveData?: boolean; effectiveType?: string };
const videoAllowed = () => {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return (
    !window.matchMedia(REDUCED).matches &&
    // Только на экранах от планшета: на телефоне ролик (3,6 МБ) почти не виден под текстом, а трафик и батарею ест
    window.matchMedia("(min-width: 768px)").matches &&
    connection?.saveData !== true &&
    // На медленной связи (2g/3g) — только заставка
    (connection?.effectiveType === undefined || connection.effectiveType === "4g")
  );
};

/**
 * Фоновое видео первого экрана. Без звука, по кругу, проявляется поверх кадра-заставки,
 * когда реально начало играть. Не загружается вовсе на телефоне, на медленной связи, при отключённой
 * анимации (prefers-reduced-motion) или экономии трафика (Save-Data) — остаётся заставка.
 * Ролик начинает грузиться только после загрузки страницы, чтобы не отнимать канал у текста и фото.
 */
export function HeroVideo({ src, className = "" }: { src: string; className?: string }) {
  // На сервере видео нет — только заставка; в браузере решаем по настройкам пользователя
  const enabled = useSyncExternalStore(subscribe, videoAllowed, () => false);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  // Ждём событие load страницы и свободную минуту браузера, потом подставляем ролик
  useEffect(() => {
    if (!enabled) return;
    let idle = 0;
    const start = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => setLoaded(true), { timeout: 2000 }) : window.setTimeout(() => setLoaded(true), 300);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [enabled]);

  useEffect(() => {
    // Некоторые браузеры не запускают autoplay сами — пробуем явно; если запрещено, остаётся заставка
    if (loaded) ref.current?.play().catch(() => {});
  }, [loaded]);

  if (!enabled || !loaded) return null;
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={`transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
