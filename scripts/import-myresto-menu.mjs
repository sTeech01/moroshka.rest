// Импорт реального меню из текущего сервиса доставки myresto в заглушку iiko.
// myresto работает поверх iikoCloud и отдаёт меню почти в формате /api/2/menu/by_id,
// поэтому ID блюд и организации — настоящие ID из iiko ресторана.
//
// Запуск: npm run menu:import   (перезаписывает data/iiko-mock/menu.json и stop-list.json)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = process.env.MYRESTO_URL ?? "https://moroshka_t.myresto.online";
const OUT = path.join(process.cwd(), "data", "iiko-mock");

const res = await fetch(`${SOURCE}/api/v1/menu`, { headers: { accept: "application/json" } });
if (!res.ok) throw new Error(`myresto ответил ${res.status}`);
const { result, error } = await res.json();
if (error || !result?.itemCategories) throw new Error(`myresto: неожиданный ответ ${JSON.stringify(error)}`);

// Напитки в iiko заведены в граммах — на сайте показываем миллилитры
const isDrinks = (name) => /чай|кофе|напит|сок|вода|морс|лимонад/i.test(name);
const restrictions = (r) => ({
  minQuantity: r?.minQuantity ?? 0,
  maxQuantity: r?.maxQuantity ?? 0,
  freeQuantity: r?.freeQuantity ?? 0,
  byDefault: r?.byDefault ?? 0,
});
const imageUrl = (img) => img?.src ?? img?.url ?? null;

const menu = {
  id: "myresto",
  name: "Доставка",
  description: `Импорт из ${SOURCE} (${new Date().toISOString().slice(0, 10)}). Заменить ответом iikoCloud /api/2/menu/by_id после подключения API`,
  itemCategories: result.itemCategories.map((c) => ({
    id: c.id,
    name: c.name.trim(),
    description: c.description ?? "",
    isHidden: Boolean(c.isHidden),
    buttonImageUrl: imageUrl(c.buttonImage),
    items: c.items.map((i) => ({
      itemId: i.itemId,
      sku: i.sku ?? "",
      name: i.name,
      description: i.description ?? "",
      type: "DISH",
      orderItemType: i.isCompound ? "Compound" : "Product",
      measureUnit: isDrinks(c.name) ? "мл" : "г",
      isHidden: Boolean(i.isHidden),
      itemSizes: i.itemSizes.map((s) => ({
        sizeId: s.sizeId ?? null,
        sizeCode: s.sizeCode ?? null,
        sizeName: s.sizeName || null,
        isDefault: Boolean(s.isDefault),
        portionWeightGrams: s.portionWeightGrams ?? null,
        prices: s.prices.map((p) => ({ organizationId: p.organizationId ?? null, price: p.price ?? null })),
        itemModifierGroups: (s.itemModifierGroups ?? []).map((g) => ({
          itemGroupId: g.itemGroupId ?? null,
          sku: g.sku ?? "",
          name: g.name,
          description: g.description ?? "",
          restrictions: restrictions(g.restrictions),
          canBeDivided: Boolean(g.canBeDivided),
          isHidden: Boolean(g.isHidden),
          childModifiersHaveMinMaxRestrictions: Boolean(g.childModifiersHaveMinMaxRestrictions),
          items: (g.items ?? []).map((m) => ({
            itemId: m.itemId,
            sku: m.sku ?? "",
            name: m.name,
            description: m.description ?? "",
            prices: (m.prices ?? []).map((p) => ({ organizationId: p.organizationId ?? null, price: p.price ?? null })),
            restrictions: restrictions(m.restrictions),
            portionWeightGrams: m.portionWeightGrams ?? null,
            isHidden: Boolean(m.isHidden),
            buttonImageUrl: imageUrl(m.buttonImage),
          })),
        })),
        buttonImageUrl: imageUrl(s.buttonImage),
      })),
    })),
  })),
};

const organizationId = menu.itemCategories.flatMap((c) => c.items).flatMap((i) => i.itemSizes).flatMap((s) => s.prices)[0]?.organizationId;

// Стоп-лист myresto не отдаёт (allowStopLists: false) — пустой
const stopList = { correlationId: "myresto", terminalGroupStopLists: [] };

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "menu.json"), JSON.stringify(menu, null, 2) + "\n");
await writeFile(path.join(OUT, "stop-list.json"), JSON.stringify(stopList, null, 2) + "\n");

const items = menu.itemCategories.flatMap((c) => c.items);
console.log(`Категорий: ${menu.itemCategories.length}, позиций: ${items.length}, с фото: ${items.filter((i) => i.itemSizes.some((s) => s.buttonImageUrl)).length}`);
console.log(`Организация iiko: ${organizationId}`);
