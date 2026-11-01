import "server-only";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Акции из группы ресторана ВКонтакте (раздел /akcii).
 * Сотрудники публикуют пост в группе с хэштегом #акция_морошка — сайт сам забирает такие посты
 * (wall.get) и показывает их: текст, фото, дату и ссылку на пост. Хэштег сняли или пост удалили —
 * акция пропадает с сайта. Если в тексте есть срок («до 30 ноября», «до 30.11»), после него акция скрывается.
 *
 * Настройки (.env):
 *   VK_SERVICE_TOKEN — сервисный ключ доступа приложения ВК (vk.com/apps?act=manage → приложение → Ключи доступа).
 *                      Ключ сообщества VK_GROUP_TOKEN (уведомления о заявках) для чтения стены не подходит.
 *   VK_WALL_DOMAIN   — короткий адрес группы; по умолчанию берётся из ссылки «ВКонтакте» в настройках сайта.
 * Посты обновляются раз в 10 минут; мгновенно — через Callback API ВК (src/app/api/vk-callback/route.ts).
 */

export const VK_PROMOS_TAG = "vk-promos";
export const PROMO_HASHTAG = "#акция_морошка";

export type VkPromo = {
  id: string;
  url: string;
  /** Дата публикации, ISO */
  date: string;
  /** Срок акции из текста, ISO (конец дня по Губкинскому), если указан */
  until: string | null;
  /** Первая строка текста — заголовок карточки */
  title: string;
  /** Остальной текст без хэштегов */
  text: string;
  photos: { url: string; width: number; height: number }[];
};

type VkSize = { url: string; width: number; height: number; type?: string };
type VkAttachment = { type: string; photo?: { sizes: VkSize[]; orig_photo?: VkSize } };
type VkPost = {
  id: number;
  owner_id: number;
  date: number;
  text: string;
  is_pinned?: number;
  marked_as_ads?: number;
  attachments?: VkAttachment[];
  copy_history?: VkPost[];
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

/** Ссылки ВК «[club123|Морошка]», «[id1|Иван]» → «Морошка», «Иван»; хэштеги убираем */
const cleanText = (text: string) =>
  text
    .replace(/\[(?:club|public|id)\d+\|([^\]]+)\]/g, "$1")
    .replace(/(^|\s)#[\p{L}\d_@]+/gu, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const biggest = (p: NonNullable<VkAttachment["photo"]>) =>
  p.orig_photo ?? p.sizes.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));

/** Посты стены → акции с хэштегом, без просроченных; закреплённый пост — первым, дальше свежие */
export function toPromos(posts: VkPost[], now = new Date()): VkPromo[] {
  const tag = PROMO_HASHTAG.toLowerCase();
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
    .filter((p) => (p.title || p.photos.length) && (!p.until || new Date(p.until) > now));
}

/** Акции из ВК. Нет ключа или ВК не ответил — пустой список (раздел покажет «акций пока нет») */
export async function getVkPromos(groupLink: string | null): Promise<VkPromo[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });
  cacheTag(VK_PROMOS_TAG);

  const token = process.env.VK_SERVICE_TOKEN;
  const domain = process.env.VK_WALL_DOMAIN || vkDomain(groupLink);
  if (!token || !domain) return [];

  try {
    const body = new URLSearchParams({ domain, count: "100", filter: "owner", access_token: token, v: "5.199" });
    const res = await fetch(`${API}/wall.get`, { method: "POST", body });
    const data = (await res.json()) as { response?: { items: VkPost[] }; error?: { error_code: number; error_msg: string } };
    if (!data.response) throw new Error(data.error ? `${data.error.error_code} ${data.error.error_msg}` : String(res.status));
    return toPromos(data.response.items);
  } catch (error) {
    console.error("[vk-promos] wall.get", error);
    return [];
  }
}
