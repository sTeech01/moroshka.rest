"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const videoAllowed = () =>
  !window.matchMedia(REDUCED).matches &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData !== true;

/**
 * Фоновое видео первого экрана. Без звука, по кругу, проявляется поверх кадра-заставки,
 * когда реально начало играть. Не загружается вовсе, если в системе отключена анимация
 * (prefers-reduced-motion) или включена экономия трафика (Save-Data) — остаётся заставка.
 */
export function HeroVideo({ src, className = "" }: { src: string; className?: string }) {
  // На сервере видео нет — только заставка; в браузере решаем по настройкам пользователя
  const enabled = useSyncExternalStore(subscribe, videoAllowed, () => false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Некоторые браузеры не запускают autoplay сами — пробуем явно; если запрещено, остаётся заставка
    if (enabled) ref.current?.play().catch(() => {});
  }, [enabled]);

  if (!enabled) return null;
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
