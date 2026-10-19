import { iikoPost, requireEnv } from "@/lib/iiko/client";
import type { IikoExternalMenu, IikoStopListResponse } from "@/lib/iiko/types";
import type { MenuSource } from "../types";
import { mockMenuSource } from "./mock";

const externalMenu = (externalMenuId: string, priceCategoryId?: string) =>
  iikoPost<IikoExternalMenu>("/api/2/menu/by_id", {
    externalMenuId,
    organizationIds: [requireEnv("IIKO_ORGANIZATION_ID")],
    priceCategoryId: priceCategoryId || null,
  });

/** Меню и стоп-лист из iikoCloud. Включается MENU_PROVIDER=iiko */
export const iikoMenuSource: MenuSource = {
  get organizationId() {
    return process.env.IIKO_ORGANIZATION_ID;
  },
  getExternalMenu: () => externalMenu(requireEnv("IIKO_EXTERNAL_MENU_ID"), process.env.IIKO_PRICE_CATEGORY_ID),
  // Пока второе внешнее меню («Зал») не заведено в iiko — показываем перенесённое со старого сайта
  getHallMenu: () =>
    process.env.IIKO_HALL_MENU_ID
      ? externalMenu(process.env.IIKO_HALL_MENU_ID, process.env.IIKO_HALL_PRICE_CATEGORY_ID)
      : mockMenuSource.getHallMenu(),
  async getStopList() {
    const res = await iikoPost<IikoStopListResponse>("/api/1/stop_lists", {
      organizationIds: [requireEnv("IIKO_ORGANIZATION_ID")],
      terminalGroupsIds: [requireEnv("IIKO_TERMINAL_GROUP_ID")],
    });
    return res.terminalGroupStopLists.flatMap((o) =>
      o.items.flatMap((t) => t.items.filter((i) => i.balance <= 0).map((i) => i.productId)),
    );
  },
};
