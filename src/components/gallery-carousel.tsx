"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content";
import { useLightbox } from "./photo-lightbox";

const pad = (n: number) => String(n).padStart(2, "0");

/** Сколько ширины кадра соседние кадры заходят под центральный (с каждой стороны) */
const OVERLAP = 0.16;

/**
 * Карусель фото «веером»: центральный кадр крупно и впереди, соседние — меньше, темнее
 * и как бы за ним (заходят под него). Стартует с середины — фото и слева, и справа.
 * Листать — только перетаскиванием (зажатой кнопкой мыши или пальцем) и клавишами ←/→.
 * Прокрутка (колесо, тачпад, Shift+колесо) карусель не листает — по просьбе заказчика: у дорожки
 * overflow: hidden, кадры двигает только скрипт.
 * Нажатие на фото открывает его во весь экран. Внизу — номер кадра и золотая полоса прогресса.
 */
export function GalleryCarousel({ images, title }: { images: Img[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { open, dialog } = useLightbox(images);
  // Перетаскивание мышью: откуда начали и сдвинули ли (тогда клик по фото — не открытие)
  const drag = useRef({ active: false, x: 0, left: 0, moved: false, start: 0 });

  const slides = useCallback(() => [...(trackRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? [])], []);

  const goTo = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const track = trackRef.current;
      const list = slides();
      const target = list[Math.max(0, Math.min(list.length - 1, i))];
      if (!track || !target) return;
      track.scrollTo({ left: target.offsetLeft + target.offsetWidth / 2 - track.clientWidth / 2, behavior });
    },
    [slides],
  );

  // Раскладка «веером» по положению каждого кадра относительно центра + номер текущего
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const layout = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides().forEach((s, i) => {
        const offset = (s.offsetLeft + s.offsetWidth / 2 - mid) / s.offsetWidth; // 0 — в центре, ±1 — соседний
        const d = Math.min(Math.abs(offset), 2.5);
        s.style.transform = `scale(${1 - Math.min(d, 1.5) * 0.2})`;
        s.style.zIndex = String(100 - Math.round(d * 10));
        s.style.filter = `brightness(${1 - Math.min(d, 1.5) * 0.35})`;
        if (Math.abs(offset) < bestDist) [best, bestDist] = [i, Math.abs(offset)];
      });
      setCurrent(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    };
    goTo(Math.floor((images.length - 1) / 2), "instant");
    layout();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [goTo, slides, images.length]);

  // Отпустили: встаём на ближайший кадр; короткий рывок (> 40 px) — на соседний
  const endDrag = (clientX: number) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    trackRef.current?.classList.remove("is-dragging");
    if (!d.moved) return;
    const dx = clientX - d.x;
    goTo(current === d.start && Math.abs(dx) > 40 ? d.start - Math.sign(dx) : current);
  };

  return (
    <div>
      <h2 id="gallery-title" className="h-display container-site text-3xl lg:text-4xl">
        {title}
      </h2>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="карусель"
        aria-labelledby="gallery-title"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") (e.preventDefault(), goTo(current + 1));
          if (e.key === "ArrowLeft") (e.preventDefault(), goTo(current - 1));
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { active: true, x: e.clientX, left: trackRef.current!.scrollLeft, moved: false, start: current };
          trackRef.current!.classList.add("is-dragging");
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.active) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true;
            // Дальше движение — наше, даже если указатель уйдёт с карусели
            trackRef.current!.setPointerCapture(e.pointerId);
          }
          if (d.moved) trackRef.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => endDrag(e.clientX)}
        onPointerCancel={(e) => endDrag(e.clientX)}
        className="carousel-track relative flex cursor-grab touch-pan-y overflow-hidden py-10 outline-none select-none lg:py-12"
      >
        {images.map((img, i) => (
          <button
            key={img.url}
            data-slide
            type="button"
            onClick={() => !drag.current.moved && open(i)}
            onDragStart={(e) => e.preventDefault()}
            aria-label={`Открыть фото ${i + 1} из ${images.length}: ${img.alt || title}`}
            style={{ marginInline: `calc(var(--slide) * -${OVERLAP})` }}
            className="carousel-slide group relative aspect-[4/3] w-(--slide) shrink-0 overflow-hidden rounded-[22px] bg-velvet shadow-[0_30px_70px_-30px_rgb(0_0_0/0.95)] transition-[transform,filter] duration-200 ease-out"
          >
            <Image src={img.url} alt={img.alt} fill draggable={false} sizes="(min-width: 1024px) 510px, 64vw" className="object-cover" />
            {/* Значок «увеличить» — у центрального кадра при наведении */}
            <span
              aria-hidden
              className={`absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-night/50 text-snow opacity-0 ring-1 ring-snow/25 backdrop-blur-sm transition-opacity duration-300 ${i === current ? "group-hover:opacity-100" : ""}`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-2 flex w-[min(100%-2rem,32rem)] items-center gap-5">
        <span className="font-display text-sm text-berry tabular-nums">
          {pad(current + 1)} <span className="text-muted">/ {pad(images.length)}</span>
        </span>
        <span aria-hidden className="relative h-px flex-1 bg-snow/15">
          <span
            className="absolute inset-y-0 left-0 bg-berry transition-[width] duration-500 ease-(--ease-soft)"
            style={{ width: `${((current + 1) / images.length) * 100}%` }}
          />
        </span>
      </div>
      {dialog}
    </div>
  );
}
