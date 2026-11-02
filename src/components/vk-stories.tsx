"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VkPost } from "@/lib/vk-posts";

const dayMonth = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Asia/Yekaterinburg" });

/**
 * Лента «Новое в меню»: посты из ВК с хэштегом #новинка_морошка (lib/vk-posts) — вертикальные карточки,
 * как сторис (ресторан снимает блюда в формате 9:16, название и цена напечатаны прямо на фото).
 * Каждое фото поста — своя карточка. Листать: пальцем / тачпадом, на компьютере — стрелками в заголовке.
 * Нажатие открывает пост: все его фото (листаются), текст, кнопки «Меню» и «Подробнее во ВКонтакте».
 */
export function VkStories({ posts, title, eyebrow }: { posts: VkPost[]; title: string; eyebrow?: string }) {
  const cards = posts.flatMap((post, p) => post.photos.map((photo, i) => ({ key: `${post.id}-${i}`, p, i, photo, post })));
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [open, setOpen] = useState<{ p: number; i: number } | null>(null);

  const measure = useCallback(() => {
    const t = track.current;
    if (t) setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  if (cards.length === 0) return null;
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="eyebrow mb-3 text-berry">{eyebrow}</p>}
          <h2 className="h-display text-3xl lg:text-4xl">{title}</h2>
        </div>
        {!(edges.start && edges.end) && (
          <div className="hidden gap-2 md:flex">
            <ArrowButton label="Назад" d="M15 5l-7 7 7 7" disabled={edges.start} onClick={() => scroll(-1)} />
            <ArrowButton label="Дальше" d="M9 5l7 7-7 7" disabled={edges.end} onClick={() => scroll(1)} />
          </div>
        )}
      </div>

      <div ref={track} onScroll={measure} className="chip-rail -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0 lg:mt-8 lg:gap-4">
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setOpen({ p: c.p, i: c.i })}
            aria-label={`Открыть: ${c.post.title || "новинка меню"}`}
            className="group relative aspect-[9/16] w-[44vw] max-w-[240px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-fill shadow-[0_24px_60px_-30px_rgb(0_0_0/0.9)] ring-1 ring-snow/10 sm:w-[220px] lg:w-[min(240px,calc((100svh-300px)*9/16))]"
          >
            <Image
              src={c.photo.url}
              alt=""
              fill
              sizes="(min-width: 640px) 240px, 44vw"
              className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      {open && <PostDialog post={posts[open.p]} start={open.i} onClose={() => setOpen(null)} />}
    </div>
  );
}

function ArrowButton({ label, d, disabled, onClick }: { label: string; d: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full text-snow ring-1 ring-snow/25 transition-colors hover:text-berry hover:ring-berry/70 disabled:opacity-30 disabled:hover:text-snow disabled:hover:ring-snow/25"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}

/** Окно поста: фото слева (листаются), текст и кнопки справа; на телефоне — друг под другом */
function PostDialog({ post, start, onClose }: { post: VkPost; start: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState(start);
  const n = post.photos.length;
  const step = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    ref.current?.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={post.title || "Новинка меню"}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      className="m-auto h-dvh max-h-none w-dvw max-w-none overflow-y-auto bg-transparent p-0 text-snow backdrop:bg-night/90 backdrop:backdrop-blur-sm"
    >
      <div
        className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-16 md:flex-row md:gap-10 md:px-10"
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      >
        <div className="relative aspect-[9/16] h-[min(62dvh,560px)] shrink-0 overflow-hidden rounded-[22px] bg-fill md:h-[min(82dvh,720px)]">
          <Image src={post.photos[i].url} alt={post.title} fill sizes="(min-width: 768px) 405px, 62vw" className="object-cover" priority />
          {n > 1 && (
            <>
              <PhotoStep label="Предыдущее фото" side="left-2" d="M15 5l-7 7 7 7" onClick={() => step(-1)} />
              <PhotoStep label="Следующее фото" side="right-2" d="M9 5l7 7-7 7" onClick={() => step(1)} />
              <div className="absolute inset-x-0 top-3 flex gap-1.5 px-3" aria-hidden>
                {post.photos.map((_, k) => (
                  <span key={k} className={`h-[3px] flex-1 rounded-full ${k === i ? "bg-snow" : "bg-snow/35"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-full max-w-md">
          <p className="text-[13px] text-lichen">{dayMonth(post.date)}</p>
          {post.title && <h2 className="h-display mt-2 text-[1.75rem] leading-tight lg:text-[2rem]">{post.title}</h2>}
          {post.text && <p className="mt-4 text-[16px] leading-relaxed whitespace-pre-line text-soft">{post.text}</p>}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="btn btn-berry" onClick={() => ref.current?.close()}>
              Меню ресторана
            </Link>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              Подробнее во ВКонтакте ↗
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => ref.current?.close()}
        aria-label="Закрыть"
        autoFocus
        className="fixed top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-snow/10 ring-1 ring-snow/20 backdrop-blur-sm transition-colors hover:bg-snow/20 sm:top-6 sm:right-6"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </dialog>
  );
}

function PhotoStep({ label, side, d, onClick }: { label: string; side: string; d: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 ${side} grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-night/45 ring-1 ring-snow/20 backdrop-blur-sm transition-colors hover:bg-night/70`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}
