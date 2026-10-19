// Смоук-тест CMS без запуска Next: поднимает Payload, при пустой базе выполняет сид,
// и печатает, что лежит в базе.
// Запуск: npm run cms:check
import { getPayload } from "payload";
import config from "../src/payload.config";

const payload = await getPayload({ config });

const counts = Object.fromEntries(
  await Promise.all(
    (["pages", "events", "media", "promos", "users"] as const).map(async (c) => [c, (await payload.count({ collection: c })).totalDocs]),
  ),
);
console.log("Документы:", counts);

const home = await payload.findGlobal({ slug: "home", depth: 1 });
const heroUrl = typeof home.heroImage === "object" ? home.heroImage?.url : home.heroImage;
console.log("Главная:", home.heroTitle, "| фото:", heroUrl, "| галерея:", home.gallery?.length ?? 0);

const delivery = await payload.findGlobal({ slug: "delivery" });
console.log("Доставка: мин.", delivery.minOrderSum, "₽, приём", delivery.acceptFrom, "–", delivery.acceptUntil);

const { docs } = await payload.find({ collection: "pages", where: { slug: { equals: "privacy-policy" } }, limit: 1 });
const root = docs[0]?.content?.root;
console.log("Соглашение:", docs[0]?.title, "| блоков:", root?.children?.length ?? 0);

// Фильтр промо по месту показа (как в getPromos): создаём временный баннер и удаляем
const context = { disableRevalidate: true };
const promo = await payload.create({ collection: "promos", data: { title: "check", placement: ["menu"], active: true }, context });
const inMenu = await payload.count({ collection: "promos", where: { placement: { in: ["menu"] } } });
const inHome = await payload.count({ collection: "promos", where: { placement: { in: ["home"] } } });
await payload.delete({ collection: "promos", id: promo.id, context });
console.log("Промо-фильтр: в меню", inMenu.totalDocs, "(ожидается ≥1), на главной без него", inHome.totalDocs);

// Меню из заглушки iiko через общий маппер сайта
const { mockMenuSource } = await import("../src/lib/providers/menu/mock");
const { mapIikoMenu } = await import("../src/lib/menu/map-iiko");
const menu = mapIikoMenu(await mockMenuSource.getExternalMenu(), new Set(await mockMenuSource.getStopList()), mockMenuSource.organizationId);
const dishes = menu.categories.flatMap((c) => c.dishes);
console.log(`Меню: ${menu.categories.length} категорий, ${dishes.length} блюд, без цены отброшено: 0 ожидается`);
for (const c of menu.categories) console.log(`  ${c.name} (/menu#${c.slug}): ${c.dishes.map((d) => `${d.name} ${d.priceFrom}₽`).join("; ")}`);
console.log("  пример адреса блюда:", `/menu/${dishes[0]?.slug}`);

process.exit(0);
