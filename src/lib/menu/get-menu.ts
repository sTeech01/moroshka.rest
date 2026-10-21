import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getMenuSource } from "@/lib/providers";
import { mapIikoMenu } from "./map-iiko";
import type { Dish, Menu } from "./types";

export const MENU_TAG = "menu";
export const STOP_LIST_TAG = "stop-list";

async function getExternalMenu() {
  "use cache";
  cacheLife("menu");
  cacheTag(MENU_TAG);
  return getMenuSource().getExternalMenu();
}

async function getHallRaw() {
  "use cache";
  cacheLife("menu");
  cacheTag(MENU_TAG);
  return getMenuSource().getHallMenu();
}

/**
 * Меню доставки с учётом стоп-листа.
 * Если у блюда нет фото в iiko, берём фото того же блюда (тот же itemId) из меню зала.
 */
async function buildDeliveryMenu(): Promise<Menu> {
  const source = getMenuSource();
  const [raw, hall, stopList] = await Promise.all([getExternalMenu(), getHallRaw(), source.getStopList()]);
  const menu = mapIikoMenu(raw, new Set(stopList), source.organizationId);

  const hallImages = new Map<string, string>();
  for (const c of hall.itemCategories)
    for (const i of c.items) {
      const img = i.itemSizes.find((s) => s.buttonImageUrl)?.buttonImageUrl;
      if (img) hallImages.set(i.itemId, img);
    }
  for (const c of menu.categories) for (const d of c.dishes) d.image ??= hallImages.get(d.id) ?? null;
  return menu;
}

/** Меню доставки (раздел «Доставка») */
export async function getMenu(): Promise<Menu> {
  "use cache";
  cacheLife("stopList");
  cacheTag(MENU_TAG, STOP_LIST_TAG);
  return buildDeliveryMenu();
}

export async function getDishBySlug(slug: string): Promise<Dish | undefined> {
  const menu = await getMenu();
  return menu.categories.flatMap((c) => c.dishes).find((d) => d.slug === slug);
}

/** Свежие данные без кэша — для проверки цен и стоп-листа при оформлении заказа */
export async function getMenuFresh(): Promise<Menu> {
  return buildDeliveryMenu();
}

export type HallMenu = Menu & {
  /** itemId → slug блюда в доставке: «Можно заказать домой» */
  deliverySlugs: Record<string, string>;
};

/** Меню зала (раздел «Меню»): витрина без корзины, стоп-лист не применяется */
export async function getHallMenu(): Promise<HallMenu> {
  "use cache";
  cacheLife("stopList");
  cacheTag(MENU_TAG, STOP_LIST_TAG);

  const source = getMenuSource();
  const [raw, delivery] = await Promise.all([getHallRaw(), getMenu()]);
  const menu = mapIikoMenu(raw, new Set(), source.organizationId);

  const deliverySlugs: Record<string, string> = {};
  for (const c of delivery.categories) for (const d of c.dishes) if (d.inStock) deliverySlugs[d.id] = d.slug;
  return { ...menu, deliverySlugs };
}

/** Барная карта (раздел «Меню» → «Бар»): витрина, у позиций несколько объёмов */
export async function getBarMenu(): Promise<Menu> {
  "use cache";
  cacheLife("menu");
  cacheTag(MENU_TAG);
  const source = getMenuSource();
  return mapIikoMenu(await source.getBarMenu(), new Set(), source.organizationId);
}
