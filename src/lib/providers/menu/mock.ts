import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IikoExternalMenu, IikoStopListResponse } from "@/lib/iiko/types";
import type { MenuSource } from "../types";

const dir = path.join(process.cwd(), "data", "iiko-mock");

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(dir, file), "utf8")) as T;
}

/**
 * Заглушка iiko: читает сохранённые ответы API из data/iiko-mock.
 * Сейчас там реальное меню, импортированное из myresto (npm run menu:import)
 */
export const mockMenuSource: MenuSource = {
  // Организация ресторана в iiko — из цен меню myresto
  organizationId: "e10b3abe-7d88-4340-8ae2-70c7560c0c13",
  getExternalMenu: () => readJson<IikoExternalMenu>("menu.json"),
  // Меню зала перенесено со старого сайта (npm run menu:hall)
  getHallMenu: () => readJson<IikoExternalMenu>("hall-menu.json"),
  async getStopList() {
    const res = await readJson<IikoStopListResponse>("stop-list.json");
    return res.terminalGroupStopLists.flatMap((o) =>
      o.items.flatMap((t) => t.items.filter((i) => i.balance <= 0).map((i) => i.productId)),
    );
  },
};
