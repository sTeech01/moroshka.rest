import { revalidateTag } from "next/cache";
import { VK_POSTS_TAG } from "@/lib/vk-posts";

/**
 * Callback API ВКонтакте: группа сама сообщает сайту о новом посте — «Акции» и «Новое в меню» обновляются сразу,
 * а не через 10 минут. Настройка в группе: Управление → Работа с API → Callback API:
 *   адрес — https://<сайт>/api/vk-callback, секретный ключ — VK_CALLBACK_SECRET,
 *   строка подтверждения из ВК — в VK_CALLBACK_CONFIRM, типы событий — «Записи на стене: добавление» и «репост».
 */
export async function POST(req: Request) {
  const event = (await req.json().catch(() => null)) as { type?: string; secret?: string } | null;
  if (!event?.type) return new Response("bad request", { status: 400 });

  if (event.type === "confirmation") return new Response(process.env.VK_CALLBACK_CONFIRM ?? "", { status: 200 });

  const secret = process.env.VK_CALLBACK_SECRET;
  if (!secret || event.secret !== secret) return new Response("forbidden", { status: 403 });

  if (event.type === "wall_post_new" || event.type === "wall_repost") revalidateTag(VK_POSTS_TAG, { expire: 0 });
  // ВК ждёт ровно «ok», иначе будет повторять запрос
  return new Response("ok", { status: 200 });
}
