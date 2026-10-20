import Image from "next/image";
import Link from "next/link";
import type { Img } from "@/lib/content";

type EventPreview = { slug: string; title: string; date: string; summary: string | null; cover: Img | null };

const TZ = "Asia/Yekaterinburg";

/**
 * Дата события по времени Губкинского (UTC+5): «14 ноября · 19:00».
 * Время 00:00 означает «весь день» (например, запуск меню) — тогда только «23 октября».
 */
export const formatEventDate = (date: string) => {
  const d = new Date(date);
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const day = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });
  return time === "00:00" ? day : `${day} · ${time}`;
};

/** Событие с обложкой — для страницы афиши */
export function EventCard({ event }: { event: EventPreview }) {
  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-velvet">
        {event.cover && (
          <Image
            src={event.cover.url}
            alt={event.cover.alt || event.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4 text-[13px] tracking-[0.16em] text-berry uppercase">{formatEventDate(event.date)}</div>
      <div className="h-display mt-1.5 text-2xl group-hover:text-berry">{event.title}</div>
      {event.summary && <p className="mt-1.5 text-sm text-muted">{event.summary}</p>}
    </Link>
  );
}
