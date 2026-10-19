import { revalidateTag } from "next/cache";
import { MENU_TAG, STOP_LIST_TAG } from "@/lib/menu/get-menu";
import { CONTENT_TAG } from "@/payload/revalidate";

const TAGS = [MENU_TAG, STOP_LIST_TAG, CONTENT_TAG];

/**
 * Сброс кэша. Сюда подключаются вебхуки iiko (StopListUpdate и др.), а также ручной вызов
 * после импорта данных в обход админки: POST /api/revalidate?secret=...&tag=menu|stop-list|content
 * В режиме разработки секрет не требуется.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.REVALIDATE_SECRET;
  const provided = url.searchParams.get("secret") ?? req.headers.get("authorization")?.replace(/^Bearer /, "");
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev && (!secret || provided !== secret)) return Response.json({ error: "unauthorized" }, { status: 401 });

  const requested = url.searchParams.get("tag") ?? STOP_LIST_TAG;
  const tag = TAGS.find((t) => t === requested);
  if (!tag) return Response.json({ error: `tag: ${TAGS.join(" | ")}` }, { status: 400 });

  revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tag });
}
