import "server-only";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Посты из группы ресторана ВКонтакте на сайте. Сотрудники публикуют пост в группе с хэштегом —
 * сайт сам забирает такие посты (wall.get): текст, фото, дату и ссылку на пост.
 *   #акция_морошка   — спецпредложения → раздел «Акции» (/akcii);
 *   #новинка_морошка — блюда и новинки меню → лента «Новое в меню» на главной, а если в посте упомянуто
 *                      меню события («Крабье лето») — ещё и на странице этого события. Новинка уходит
 *                      через 60 дней: цена у таких постов напечатана прямо на фото и может устареть.
 * Хэштег сняли или пост удалили — пост пропадает с сайта. Если в тексте есть срок («до 30 ноября»,
 * «до 30.11»), после него пост скрывается. Контакты в конце поста (телефон, адрес, сайт) убираются.
 *
 * Настройки (.env):
 *   VK_SERVICE_TOKEN — сервисный ключ доступа приложения ВК (vk.com/apps?act=manage → приложение → Ключи доступа).
 *                      Ключ сообщества VK_GROUP_TOKEN (уведомления о заявках) для чтения стены не подходит.
 *   VK_WALL_DOMAIN   — короткий адрес группы; по умолчанию берётся из ссылки «ВКонтакте» в настройках сайта.
 * Посты обновляются раз в 10 минут; мгновенно — через Callback API ВК (src/app/api/vk-callback/route.ts).
 */

export const VK_POSTS_TAG = "vk-posts";
export const PROMO_HASHTAG = "#акция_морошка";
export const NOVELTY_HASHTAG = "#новинка_морошка";
/** Сколько дней новинка держится на сайте */
const NOVELTY_DAYS = 60;

export type VkPost = {
  id: string;
  url: string;
  /** Дата публикации, ISO */
  date: string;
  /** Срок из текста, ISO (конец дня по Губкинскому), если указан */
  until: string | null;
  /** Первая строка текста — заголовок карточки */
  title: string;
  /** Остальной текст без хэштегов и контактов */
  text: string;
  photos: { url: string; width: number; height: number }[];
};

type VkSize = { url: string; width: number; height: number; type?: string };
type VkAttachment = { type: string; photo?: { sizes: VkSize[]; orig_photo?: VkSize } };
type RawPost = {
  id: number;
  owner_id: number;
  date: number;
  text: string;
  is_pinned?: number;
  marked_as_ads?: number;
  attachments?: VkAttachment[];
  copy_history?: RawPost[];
};

const API = process.env.VK_API_URL ?? "https://api.vk.com/method";
const MONTHS = ["январ", "феврал", "март", "апрел", "ма", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"];
// Губкинский — UTC+5: «до 30 ноября» значит до конца 30 ноября по местному времени
const TZ_OFFSET_H = 5;

/** «vk.ru/moroshkarest», «https://vk.com/moroshkarest» → «moroshkarest» */
export function vkDomain(link: string | null | undefined): string | null {
  const m = link?.match(/vk\.(?:com|ru)\/([\w.]+)/i);
  return m ? m[1] : null;
}

/** «до 30 ноября», «до 30.11», «до 30.11.2026» → конец этого дня (ISO); год — ближайший после публикации */
export function parseUntil(text: string, posted: Date): string | null {
  let day: number, month: number, year: number | null = null;
  const words = text.match(/до\s+(\d{1,2})\s+([а-яё]+)/i);
  const digits = text.match(/до\s+(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/i);
  if (words) {
    const i = MONTHS.findIndex((m) => words[2].toLowerCase().startsWith(m));
    if (i < 0) return null;
    day = Number(words[1]);
    month = i;
  } else if (digits) {
    day = Number(digits[1]);
    month = Number(digits[2]) - 1;
    if (digits[3]) year = Number(digits[3].length === 2 ? `20${digits[3]}` : digits[3]);
  } else return null;
  if (day < 1 || day > 31 || month < 0 || month > 11) return null;

  const end = (y: number) => new Date(Date.UTC(y, month, day, 23 - TZ_OFFSET_H, 59, 59));
  if (year) return end(year).toISOString();
  const y = posted.getUTCFullYear();
  // «до 10 января» в посте от 20 декабря — это следующий год
  return (end(y) < posted ? end(y + 1) : end(y)).toISOString();
}

/** Строки с контактами в конце поста — на сайте они лишние: телефон, адрес, ссылка на сайт */
const CONTACT_LINE = /^[\s📞☎📍🌐👉➡️]*(?:\+7[\s(\d]|8\s?\(?9\d\d|(?:г\.\s*Губкинский,?\s*)?мкр\.?\s*\d|(?:https?:\/\/)?moroshka\.rest)/iu;

/** Ссылки ВК «[club123|Морошка]», «[id1|Иван]» → «Морошка», «Иван»; хэштеги и контакты убираем */
const cleanText = (text: string) =>
  text
    .split("\n")
    .filter((line) => !CONTACT_LINE.test(line))
    .join("\n")
    .replace(/\[(?:club|public|id)\d+\|([^\]]+)\]/g, "$1")
    .replace(/(^|\s)#[\p{L}\d_@]+/gu, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const biggest = (p: NonNullable<VkAttachment["photo"]>) =>
  p.orig_photo ?? p.sizes.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));

/** Посты стены с хэштегом, без просроченных; закреплённый пост — первым, дальше свежие */
export function pickPosts(posts: RawPost[], hashtag: string, now = new Date(), maxAgeDays?: number): VkPost[] {
  const tag = hashtag.toLowerCase();
  const oldest = maxAgeDays ? now.getTime() - maxAgeDays * 86_400_000 : 0;
  return posts
    .filter((p) => !p.marked_as_ads && p.text.toLowerCase().includes(tag))
    .sort((a, b) => (b.is_pinned ?? 0) - (a.is_pinned ?? 0) || b.date - a.date)
    .map((p) => {
      // Репост: хэштег у нашего поста, фото и текст — часто у исходного
      const source = p.copy_history?.[0];
      const raw = cleanText([p.text, source?.text].filter(Boolean).join("\n\n"));
      const [first, ...rest] = raw.split("\n");
      const posted = new Date(p.date * 1000);
      const photos = [...(p.attachments ?? []), ...(source?.attachments ?? [])]
        .filter((a) => a.type === "photo" && a.photo)
        .map((a) => biggest(a.photo!))
        .map(({ url, width, height }) => ({ url, width, height }));
      return {
        id: `${p.owner_id}_${p.id}`,
        url: `https://vk.com/wall${p.owner_id}_${p.id}`,
        date: posted.toISOString(),
        until: parseUntil(p.text, posted),
        title: first.trim(),
        text: rest.join("\n").trim(),
        photos,
      };
    })
    .filter((p) => (p.title || p.photos.length) && (!p.until || new Date(p.until) > now) && new Date(p.date).getTime() >= oldest);
}

/** Последние 100 постов группы. Нет ключа или ВК не ответил — пустой список (разделы покажут «пока нет») */
async function getWall(groupLink: string | null): Promise<RawPost[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  cacheTag(VK_POSTS_TAG);

  const token = process.env.VK_SERVICE_TOKEN;
  const domain = process.env.VK_WALL_DOMAIN || vkDomain(groupLink);
  if (!token || !domain) return [];

  try {
    const body = new URLSearchParams({ domain, count: "100", filter: "owner", access_token: token, v: "5.199" });
    const res = await fetch(`${API}/wall.get`, { method: "POST", body });
    const data = (await res.json()) as { response?: { items: RawPost[] }; error?: { error_code: number; error_msg: string } };
    if (!data.response) throw new Error(data.error ? `${data.error.error_code} ${data.error.error_msg}` : String(res.status));
    return data.response.items;
  } catch (error) {
    console.error("[vk-posts] wall.get", error);
    return [];
  }
}

/** Акции (#акция_морошка) — раздел /akcii */
export async function getVkPromos(groupLink: string | null): Promise<VkPost[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  cacheTag(VK_POSTS_TAG);
  return pickPosts(await getWall(groupLink), PROMO_HASHTAG);
}

/** Новинки меню (#новинка_морошка) за последние 60 дней — главная и страницы событий */
export async function getVkNovelties(groupLink: string | null): Promise<VkPost[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  cacheTag(VK_POSTS_TAG);
  return pickPosts(await getWall(groupLink), NOVELTY_HASHTAG, new Date(), NOVELTY_DAYS);
}

/** Посты, где упомянуто одно из названий — например, меню события («Крабье лето») */
export function mentioning(posts: VkPost[], names: string[]): VkPost[] {
  const needles = names.map((n) => n.toLowerCase().trim()).filter((n) => n.length > 2);
  return posts.filter((p) => needles.some((n) => `${p.title}\n${p.text}`.toLowerCase().includes(n)));
}
