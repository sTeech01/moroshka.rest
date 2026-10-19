import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

export const CONTENT_TAG = "content";

/** Сбрасывает кэш контента сайта после правки в админке */
async function revalidateContent(context: Record<string, unknown>) {
  // Сид при первом запуске идёт вне запроса Next — там сбрасывать нечего
  if (context.disableRevalidate) return;
  try {
    // Динамический импорт: конфиг Payload загружает и CLI (генерация типов), где next/cache недоступен
    const { revalidateTag } = await import("next/cache");
    revalidateTag(CONTENT_TAG, { expire: 0 });
  } catch (error) {
    console.warn("[payload] revalidateTag failed", error);
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateContent(req.context);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateContent(req.context);
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  await revalidateContent(req.context);
  return doc;
};

export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
