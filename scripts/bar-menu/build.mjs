// Собирает барную карту в формате внешнего меню iiko: объёмы — размеры позиции (itemSizes).
//
//   npm run menu:bar → data/iiko-mock/bar-menu.json

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { barMenu } from "./source.mjs";

const root = process.cwd();
const organizationId = "e10b3abe-7d88-4340-8ae2-70c7560c0c13";

/** Детерминированный UUID из строки — ID не меняются между сборками */
function uuid(seed) {
  const h = createHash("sha1").update(`moroshka-bar:${seed}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const size = (seed, name, price, isDefault) => ({
  sizeId: name ? uuid(`size:${seed}:${name}`) : null,
  sizeCode: null,
  sizeName: name,
  isDefault,
  portionWeightGrams: null,
  prices: [{ organizationId, price }],
  itemModifierGroups: [],
  buttonImageUrl: null,
});

let total = 0;
const itemCategories = barMenu.categories.map((cat) => {
  const items = cat.items.map(([name, sub, ...rest]) => {
    // Одна и та же позиция может встречаться дважды с разным объёмом (морс 300 и 1000 мл)
    const seed = `${cat.name}:${name}:${rest.join("/")}`;
    let sizes;
    if (cat.volumes) {
      sizes = cat.volumes
        .map((vol, i) => (rest[i] == null ? null : { vol, price: rest[i] }))
        .filter(Boolean)
        .map((s, i) => size(seed, s.vol, s.price, i === 0));
    } else {
      const [price, vol] = rest;
      sizes = [size(seed, vol ?? null, price, true)];
    }
    if (sizes.length === 0) throw new Error(`Нет цены: ${cat.name} / ${name}`);
    total++;
    return {
      itemId: uuid(seed),
      sku: "",
      name,
      description: sub,
      type: "DISH",
      orderItemType: "Product",
      measureUnit: "мл",
      isHidden: false,
      itemSizes: sizes,
    };
  });
  return { id: uuid(`cat:${cat.name}`), name: cat.name, description: "", isHidden: false, buttonImageUrl: null, items };
});

const out = { id: "bar", name: barMenu.name, description: "Перенесено со старого сайта moroshka.rest/bar-menu", itemCategories };
writeFileSync(path.join(root, "data", "iiko-mock", "bar-menu.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Барная карта: ${itemCategories.length} разделов, ${total} позиций`);
