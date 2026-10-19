// Собирает меню зала в формате внешнего меню iiko и вырезает фото блюд со страниц старого меню.
//
//   npm run menu:hall -- <папка со страницами img-4.jpg … img-23.jpg>
//
// Без папки обновляется только JSON (фото, уже лежащие в public/images/menu, сохраняются).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { hallMenu } from "./source.mjs";

const root = process.cwd();
const pagesDir = process.argv[2];
const outImages = path.join(root, "public", "images", "menu");
const delivery = JSON.parse(readFileSync(path.join(root, "data", "iiko-mock", "menu.json"), "utf8"));
const organizationId = "e10b3abe-7d88-4340-8ae2-70c7560c0c13";

const deliveryItems = new Map(delivery.itemCategories.flatMap((c) => c.items).map((i) => [i.itemId, i]));

/** Детерминированный UUID из строки — ID не меняются между сборками */
function uuid(seed) {
  const h = createHash("sha1").update(`moroshka-hall:${seed}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const translit = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};
const slugify = (s) =>
  [...s.toLowerCase()].map((ch) => translit[ch] ?? ch).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function cropPhoto([page, x1, y1, x2, y2], file) {
  const src = path.join(pagesDir, `img-${page}.jpg`);
  const meta = await sharp(src).metadata();
  // Координаты сняты на странице, уменьшенной до высоты 2000 px
  const k = meta.height / 2000;
  const left = Math.round(x1 * k);
  const top = Math.round(y1 * k);
  const width = Math.min(Math.round((x2 - x1) * k), meta.width - left);
  const height = Math.min(Math.round((y2 - y1) * k), meta.height - top);
  await sharp(src)
    .extract({ left, top, width, height })
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(outImages, file));
}

mkdirSync(outImages, { recursive: true });

let linked = 0;
let photos = 0;
const itemCategories = [];
for (const cat of hallMenu.categories) {
  const items = [];
  for (const it of cat.items) {
    const fromDelivery = it.delivery ? deliveryItems.get(it.delivery) : undefined;
    if (it.delivery && !fromDelivery) throw new Error(`Нет в меню доставки: ${it.delivery} (${it.name})`);
    if (fromDelivery) linked++;

    let image = null;
    if (it.photo) {
      const file = `${slugify(it.name)}.webp`;
      if (pagesDir) {
        await cropPhoto(it.photo, file);
        photos++;
      }
      if (existsSync(path.join(outImages, file))) image = `/images/menu/${file}`;
    }

    items.push({
      itemId: it.delivery ?? uuid(it.name),
      sku: fromDelivery?.sku ?? "",
      name: it.name,
      description: it.desc ?? fromDelivery?.description ?? "",
      type: "DISH",
      orderItemType: "Product",
      measureUnit: it.unit ?? "г",
      isHidden: false,
      itemSizes: [
        {
          sizeId: null,
          sizeCode: null,
          sizeName: null,
          isDefault: true,
          portionWeightGrams: it.weight,
          prices: [{ organizationId, price: it.price }],
          itemModifierGroups: [],
          buttonImageUrl: image,
        },
      ],
    });
  }
  itemCategories.push({ id: uuid(`cat:${cat.name}`), name: cat.name, description: "", isHidden: false, buttonImageUrl: null, items });
}

const out = { id: "hall", name: hallMenu.name, description: "Перенесено со старого сайта moroshka.rest/menu-kitchen", itemCategories };
writeFileSync(path.join(root, "data", "iiko-mock", "hall-menu.json"), JSON.stringify(out, null, 2) + "\n");

const total = itemCategories.reduce((n, c) => n + c.items.length, 0);
console.log(`Меню зала: ${itemCategories.length} разделов, ${total} позиций, ${linked} связаны с доставкой, фото вырезано: ${photos}`);
