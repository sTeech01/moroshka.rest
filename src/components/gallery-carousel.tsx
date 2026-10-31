"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content";
import { useLightbox } from "./photo-lightbox";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Карусель фото на всю ширину экрана: кадры-«листья» листаются с прилипанием к центру,
 * центральный — крупно и ярко, соседние уменьшены и притушены (CSS, animation-timeline: view() —
 * в браузерах без поддержки просто одинаковые кадры). Листать — пальцем, колесом/тачпадом,
 * стрелками под заголовком или клавишами ←/→ на карусели. Нажатие на фото открывает его во весь экран.
 * Внизу — номер кадра и золотая полоса прогресса.
 */
export function GalleryCarousel({ images, title }: { images: Img[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { open, dialog } = useLightbox(images);

  const slides = () => [...(trackRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? [])];

  const goTo = useCallback((i: number) => {
    const list = [...(trackRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? [])];
    const target = list[(i + list.length) % list.length];
    const track = trackRef.current;
    if (!target || !track) return;
    track.scrollTo({ left: target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
  }, []);

  // Текущий кадр — тот, чей центр ближе всего к центру карусели
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        slides().forEach((s, i) => {
          const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
          if (d < bestDist) [best, bestDist] = [i, d];
        });
        setCurrent(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div>
      <div className="container-site mb-6 flex items-end justify-between gap-4 lg:mb-8">
        <h2 id="gallery-title" className="h-display text-3xl lg:text-4xl">
          {title}
        </h2>
        <div className="flex gap-2">
          <ArrowButton label="Предыдущее фото" onClick={() => goTo(current - 1)} d="M15 5l-7 7 7 7" />
          <ArrowButton label="Следующее фото" onClick={() => goTo(current + 1)} d="M9 5l7 7-7 7" />
        </div>
      </div>

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
        className="carousel-track relative flex snap-x snap-mandatory gap-4 overflow-x-auto py-6 outline-none sm:gap-6"
      >
        {images.map((img, i) => (
          <button
            key={img.url}
            data-slide
            type="button"
            onClick={() => open(i)}
            aria-label={`Открыть фото ${i + 1} из ${images.length}: ${img.alt || title}`}
            className={`carousel-slide group relative aspect-[4/3] w-(--slide) shrink-0 cursor-zoom-in snap-center overflow-hidden bg-velvet shadow-[0_30px_70px_-36px_rgb(0_0_0/0.9)] ${i % 2 ? "shape-leaf-alt" : "shape-leaf"}`}
          >
            <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 760px, 80vw" className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]" />
            {/* Значок «увеличить» — проявляется при наведении */}
            <span aria-hidden className="absolute right-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-night/50 text-snow opacity-0 ring-1 ring-snow/25 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="container-site mt-4 flex items-center gap-5">
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

function ArrowButton({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-full bg-snow/[0.06] text-snow ring-1 ring-snow/25 transition-colors ring-inset hover:text-berry hover:ring-berry/60"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}
