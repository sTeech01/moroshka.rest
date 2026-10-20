import "server-only";
import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { deliveryConfig } from "@/config/site";
import type { DeliverySettings } from "@/lib/delivery";
import type { Event, Media, Page } from "@/payload-types";
import { CONTENT_TAG } from "@/payload/revalidate";

// Чтение контента из Payload (локальный API, без HTTP).
// Всё кэшируется с тегом «content»; правка в админке сбрасывает кэш (src/payload/revalidate.ts).

const payload = () => getPayload({ config });

function cached() {
  cacheLife("content");
  cacheTag(CONTENT_TAG);
}

export type Img = { url: string; alt: string; width: number | null; height: number | null };

/** Загруженный файл → плоский объект для next/image. Без связи (id) или без файла — null */
export function toImg(media: number | Media | null | undefined): Img | null {
  if (!media || typeof media !== "object" || !media.url) return null;
  return { url: media.url, alt: media.alt, width: media.width ?? null, height: media.height ?? null };
}

const imgs = (list: (number | Media)[] | null | undefined) =>
  (list ?? []).map(toImg).filter((x): x is Img => x !== null);

export type RichTextData = NonNullable<Page["content"]>;

/** Текущее время в ISO (UTC) — Payload хранит даты так же, строки сравниваются напрямую */
const nowIso = () => new Date().toISOString();

export async function getSettings() {
  "use cache";
  cached();
  const s = await (await payload()).findGlobal({ slug: "settings" });
  return {
    phone: s.phone,
    banquetPhone: s.banquetPhone ?? null,
    email: s.email ?? null,
    address: s.address,
    hours: (s.hours ?? []).map((h) => ({ days: h.days, time: h.time })),
    vk: s.vk ?? null,
    telegram: s.telegram ?? null,
    geo: { lat: s.geo?.lat ?? null, lng: s.geo?.lng ?? null },
    legal: s.legal ?? null,
  };
}

export async function getDelivery(): Promise<DeliverySettings> {
  "use cache";
  cached();
  const d = await (await payload()).findGlobal({ slug: "delivery" });
  return {
    city: deliveryConfig.city,
    enabled: d.enabled ?? true,
    notice: d.notice || null,
    minOrderSum: d.minOrderSum ?? 1000,
    price: d.price ?? 0,
    freeFrom: d.freeFrom ?? null,
    acceptFrom: d.acceptFrom || "12:00",
    acceptUntil: d.acceptUntil || "23:00",
    leadTimeMinutes: d.leadTimeMinutes ?? 60,
    slotMinutes: d.slotMinutes ?? 30,
    deliveryTimeText: d.deliveryTimeText || null,
    pickupEnabled: d.pickupEnabled ?? true,
  };
}

export async function getHome() {
  "use cache";
  cached();
  const h = await (await payload()).findGlobal({ slug: "home", depth: 1 });
  return {
    heroTitle: h.heroTitle,
    heroSubtitle: h.heroSubtitle ?? null,
    heroImage: toImg(h.heroImage),
    kitchenText: h.kitchenText ?? null,
    kitchenImage: toImg(h.kitchenImage),
    barText: h.barText ?? null,
    barImage: toImg(h.barImage),
    featuredDishes: h.featuredDishes ?? [],
  };
}

export async function getBanquets() {
  "use cache";
  cached();
  const b = await (await payload()).findGlobal({ slug: "banquets", depth: 1 });
  return {
    title: b.title,
    intro: b.intro ?? null,
    heroImage: toImg(b.heroImage),
    halls: (b.halls ?? []).map((h) => ({ name: h.name, capacity: h.capacity ?? null, description: h.description ?? null })),
    gallery: imgs(b.gallery),
    content: b.content ?? null,
  };
}

export async function getBusinessLunch() {
  "use cache";
  cached();
  const b = await (await payload()).findGlobal({ slug: "business-lunch", depth: 1 });
  return {
    enabled: b.enabled ?? true,
    title: b.title,
    schedule: b.schedule,
    intro: b.intro ?? null,
    groups: (b.groups ?? []).map((g) => ({
      title: g.title ?? null,
      items: (g.items ?? []).map((i) => ({ name: i.name, weight: i.weight ?? null, price: i.price })),
    })),
    note: b.note ?? null,
    image: toImg(b.image),
  };
}

const toEvent = (e: Event) => ({
  slug: e.slug ?? String(e.id),
  title: e.title,
  date: e.date,
  summary: e.summary ?? null,
  cover: toImg(e.cover),
  content: e.content ?? null,
});

export async function getEvents() {
  "use cache";
  cached();
  const { docs } = await (await payload()).find({ collection: "events", sort: "date", limit: 200, depth: 1 });
  return docs.map(toEvent);
}

/** Начало сегодняшнего дня по времени Губкинского (UTC+5), в ISO UTC */
function startOfLocalDayIso() {
  const OFFSET = 5 * 3600 * 1000;
  const local = new Date(Date.now() + OFFSET);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - OFFSET).toISOString();
}

/**
 * Предстоящие события: сегодняшние показываются до конца дня, а не пропадают в момент начала.
 * Текущее время читается внутри кэша — точность до часа.
 */
export async function getUpcomingEvents(limit?: number) {
  "use cache";
  cached();
  const from = startOfLocalDayIso();
  const upcoming = (await getEvents()).filter((e) => e.date >= from);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export async function getEvent(slug: string) {
  "use cache";
  cached();
  const { docs } = await (await payload()).find({ collection: "events", where: { slug: { equals: slug } }, limit: 1, depth: 1 });
  return docs[0] ? toEvent(docs[0]) : null;
}

export type PageSection =
  | { kind: "textImage"; id: string; content: RichTextData; image: Img | null; imagePosition: "left" | "right" }
  | {
      kind: "highlight";
      id: string;
      eyebrow: string | null;
      title: string;
      stats: { value: string; label: string | null }[];
      content: RichTextData | null;
      images: Img[];
      link: { url: string; label: string } | null;
    };

function toSections(sections: Page["sections"]): PageSection[] {
  return (sections ?? []).map((s, i): PageSection => {
    const id = s.id ?? String(i);
    if (s.blockType === "textImage") {
      return { kind: "textImage", id, content: s.content, image: toImg(s.image), imagePosition: s.imagePosition ?? "right" };
    }
    return {
      kind: "highlight",
      id,
      eyebrow: s.eyebrow ?? null,
      title: s.title,
      stats: (s.stats ?? []).map((st) => ({ value: st.value, label: st.label ?? null })),
      content: s.content ?? null,
      images: imgs(s.images),
      link: s.linkUrl ? { url: s.linkUrl, label: s.linkLabel || "Подробнее" } : null,
    };
  });
}

export async function getPage(slug: Page["slug"]) {
  "use cache";
  cached();
  const { docs } = await (await payload()).find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 1 });
  const p = docs[0];
  return p
    ? {
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
        content: p.content ?? null,
        sections: toSections(p.sections),
      }
    : null;
}

export type PromoItem = { id: number; title: string; text: string | null; image: Img | null; linkUrl: string | null; linkLabel: string };

/** Активные промо для места на сайте с учётом дат показа */
export async function getPromos(placement: "home" | "menu"): Promise<PromoItem[]> {
  "use cache";
  cached();
  const now = nowIso();
  const { docs } = await (await payload()).find({
    collection: "promos",
    where: { and: [{ active: { equals: true } }, { placement: { in: [placement] } }] },
    sort: "order",
    limit: 10,
    depth: 1,
  });
  return docs
    .filter((p) => (!p.startsAt || p.startsAt <= now) && (!p.endsAt || p.endsAt >= now))
    .map((p) => ({
      id: p.id,
      title: p.title,
      text: p.text ?? null,
      image: toImg(p.image),
      linkUrl: p.linkUrl || null,
      linkLabel: p.linkLabel || "Подробнее",
    }));
}
