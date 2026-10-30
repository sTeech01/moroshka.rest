"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content";

/**
 * Миниатюры фото, которые открываются в модальном окне во весь экран.
 * Окно — нативный <dialog> (фокус внутри, Esc закрывает); листать — стрелками на экране
 * и клавишами ←/→; закрыть — крестиком, Esc или кликом мимо фото. Прокрутка страницы на время окна заблокирована.
 */
export function PhotoLightbox({
  images,
  thumbClassName = "",
  imageClassName = "",
  sizes,
}: {
  images: Img[];
  thumbClassName?: string;
  /** Классы картинки превью — например, точка кадрирования (object-[50%_20%]) */
  imageClassName?: string;
  sizes: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (index === null || !dialog || dialog.open) return;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
  }, [index]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Открыть фото: ${img.alt || `фото ${i + 1}`}`}
            className={`group relative block cursor-zoom-in overflow-hidden rounded-[16px] ${thumbClassName}`}
          >
            <Image src={img.url} alt={img.alt} fill sizes={sizes} className={`object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.04] ${imageClassName}`} />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Просмотр фото"
        className="lightbox m-auto h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 text-snow backdrop:bg-night/90 backdrop:backdrop-blur-sm"
        onClose={() => {
          setIndex(null);
          document.documentElement.style.overflow = "";
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {index !== null && (
          // Клик по пустому месту вокруг фото закрывает окно (как по фону)
          <div className="flex h-full w-full items-center justify-center p-4 sm:p-12" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative h-full max-h-[86dvh] w-full max-w-5xl">
              <Image src={images[index].url} alt={images[index].alt} fill sizes="90vw" className="object-contain" priority />
            </div>
            {images.length > 1 && (
              <>
                <LightboxButton label="Предыдущее фото" className="left-3 sm:left-6" onClick={() => step(-1)} d="M15 5l-7 7 7 7" />
                <LightboxButton label="Следующее фото" className="right-3 sm:right-6" onClick={() => step(1)} d="M9 5l7 7-7 7" />
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tracking-widest text-lichen tabular-nums">
                  {index + 1} / {images.length}
                </p>
              </>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          autoFocus
          className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-snow/10 ring-1 ring-snow/20 backdrop-blur-sm transition-colors hover:bg-snow/20 sm:top-6 sm:right-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </dialog>
    </>
  );
}

function LightboxButton({ label, className, onClick, d }: { label: string; className: string; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-snow/10 ring-1 ring-snow/20 backdrop-blur-sm transition-colors hover:bg-snow/20 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}
