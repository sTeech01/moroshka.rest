import type { Metadata } from "next";
import Link from "next/link";
import { MenuTabs } from "@/components/menu-tabs";
import { formatPrice } from "@/lib/format";
import { getBarMenu } from "@/lib/menu/get-menu";
import type { Category, Dish } from "@/lib/menu/types";

export const metadata: Metadata = {
  title: "Барная карта",
  description:
    "Барная карта ресторана «Морошка» в Губкинском: вина, крепкие напитки, настойки собственного приготовления, авторские коктейли, чай и кофе.",
  alternates: { canonical: "/bar-menu" },
};

/** Барная карта — витрина без корзины. Адрес тот же, что на старом сайте */
export default async function BarMenuPage() {
  const menu = await getBarMenu();

  return (
    <div className="theme-paper">
      <div className="container-site pt-12 pb-24 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Бар ресторана</p>
            <h1 className="h-display mt-4 text-5xl lg:text-7xl">Меню</h1>
            <MenuTabs active="bar" />
          </div>
          <Link href="/#booking" className="btn btn-line btn-sm">
            Забронировать стол
          </Link>
        </div>

        <nav
          aria-label="Разделы барной карты"
          className="z-30 -mx-4 mt-8 flex flex-wrap gap-2 border-y border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:sticky lg:top-[76px]"
        >
          {menu.categories.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="pill pill-compact shrink-0">
              {c.name}
            </a>
          ))}
        </nav>

        <div className="mt-12 grid gap-x-16 gap-y-16 lg:grid-cols-2">
          {menu.categories.map((c) => (
            <BarSection key={c.id} category={c} />
          ))}
        </div>

        <p className="mt-16 text-sm text-muted">Чрезмерное употребление алкоголя вредит вашему здоровью. Алкоголь продаётся лицам старше 18 лет.</p>
      </div>
    </div>
  );
}

/** Общие объёмы раздела (125 мл / 750 мл), если у всех позиций они одинаковые — тогда они в заголовке */
function sharedVolumes(c: Category): string[] | null {
  const key = (d: Dish) => d.sizes.map((s) => s.name ?? "").join("|");
  const first = key(c.dishes[0]);
  if (!first || c.dishes.some((d) => key(d) !== first)) return null;
  return c.dishes[0].sizes.map((s) => s.name!);
}

function BarSection({ category }: { category: Category }) {
  const volumes = sharedVolumes(category);
  return (
    <section id={category.slug} className="scroll-mt-24 lg:scroll-mt-40">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="h-display text-3xl lg:text-4xl">{category.name}</h2>
        {volumes && <span className="shrink-0 text-sm whitespace-nowrap text-muted">{volumes.join(" / ")}</span>}
      </div>
      <ul className="mt-6 flex flex-col gap-5">
        {category.dishes.map((d) => (
          <li key={d.id}>
            <div className="flex items-baseline gap-2 text-[17px]">
              <h3 className="font-semibold">{d.name}</h3>
              <span className="mb-1 min-w-6 flex-1 border-b border-dotted border-muted/50" aria-hidden />
              <span className="shrink-0 text-right whitespace-nowrap">
                {volumes ? (
                  <span className="font-bold">{d.sizes.map((s) => formatPrice(s.price)).join(" / ")}</span>
                ) : (
                  d.sizes.map((s, i) => (
                    <span key={s.id ?? i}>
                      {i > 0 && <span className="text-muted"> · </span>}
                      {s.name && <span className="text-muted">{s.name} / </span>}
                      <span className="font-bold">{formatPrice(s.price)}</span>
                    </span>
                  ))
                )}
              </span>
            </div>
            {d.description && <p className="mt-1 text-sm leading-relaxed text-muted">{d.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
