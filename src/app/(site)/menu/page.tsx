import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MenuTabs } from "@/components/menu-tabs";
import { MenuPromos } from "@/components/promo-banners";
import { features } from "@/config/site";
import { getDelivery, getPromos, getSettings } from "@/lib/content";
import { orderSection } from "@/lib/delivery";
import { formatPrice, formatWeight } from "@/lib/format";
import { getHallMenu } from "@/lib/menu/get-menu";
import type { Dish } from "@/lib/menu/types";

export const metadata: Metadata = {
  title: "Меню ресторана",
  description:
    "Меню ресторана «Морошка» в Губкинском: салаты, северные закуски, строганина и рубанина, супы, оленина и муксун, пасты неро, десерты.",
  alternates: { canonical: "/menu" },
};

/**
 * Меню зала — витрина без корзины. Блюда, которые можно заказать на сайте (тот же ID в iiko
 * в меню доставки/самовывоза), получают ссылку «Можно заказать с собой» (или «домой» при доставке).
 */
export default async function MenuPage() {
  const [menu, delivery, promos, settings] = await Promise.all([getHallMenu(), getDelivery(), getPromos("menu"), getSettings()]);
  // Заказ на сайте — когда включены онлайн-заказы и в админке есть доставка или самовывоз
  const ordering = features.onlineOrders && (delivery.enabled || delivery.pickupEnabled);
  const section = orderSection(delivery);
  const deliverySlugs = ordering ? menu.deliverySlugs : {};

  return (
    <div className="theme-paper">
      <div className="container-site pt-12 pb-24 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Кухня ресторана</p>
            <h1 className="h-display mt-4 text-5xl lg:text-7xl">Меню</h1>
            <MenuTabs active="kitchen" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/#booking" className="btn btn-line btn-sm">
              Забронировать стол
            </Link>
            {ordering && (
              <Link href="/delivery" className="btn btn-ink btn-sm">
                {section.menuCta}
              </Link>
            )}
          </div>
        </div>
        {ordering ? (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            {delivery.enabled
              ? "Часть блюд можно заказать домой — у них отметка «Можно заказать домой». Цены в зале и в доставке могут отличаться."
              : "Часть блюд можно заказать на сайте и забрать в ресторане — у них отметка «Можно заказать с собой». Цены в зале и с собой могут отличаться."}
          </p>
        ) : (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Блюда можно взять с собой — закажите по телефону{" "}
            <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="font-semibold whitespace-nowrap text-text hover:text-berry">
              {settings.phone}
            </a>{" "}
            и заберите в ресторане.
          </p>
        )}

        <MenuPromos promos={promos} />

        <nav
          aria-label="Разделы меню"
          className="z-30 mt-8 flex flex-wrap gap-2 rounded-card bg-surface/90 p-2.5 shadow-(--shadow-soft) backdrop-blur-md lg:sticky lg:top-[88px]"
        >
          {menu.categories.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="pill pill-compact shrink-0">
              {c.name}
            </a>
          ))}
        </nav>

        <div className="mt-12 flex flex-col gap-16">
          {menu.categories.map((c) => {
            const withPhoto = c.dishes.filter((d) => d.image);
            const rest = c.dishes.filter((d) => !d.image);
            return (
              <section key={c.id} id={c.slug} className="scroll-mt-24 lg:scroll-mt-40">
                <h2 className="h-display text-4xl">{c.name}</h2>
                {withPhoto.length > 0 && (
                  <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                    {withPhoto.map((d) => (
                      <HallDishCard key={d.id} dish={d} orderLink={deliverySlugs[d.id] ? { slug: deliverySlugs[d.id], label: section.dishLink } : undefined} />
                    ))}
                  </div>
                )}
                {rest.length > 0 && (
                  <ul className={`grid gap-x-12 gap-y-6 lg:grid-cols-2 ${withPhoto.length ? "mt-10" : "mt-7"}`}>
                    {rest.map((d) => (
                      <HallDishRow key={d.id} dish={d} orderLink={deliverySlugs[d.id] ? { slug: deliverySlugs[d.id], label: section.dishLink } : undefined} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function dishWeight(dish: Dish) {
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  return formatWeight(size.weight, dish.measureUnit);
}

/** Ссылка на блюдо в разделе заказа: «Можно заказать с собой →» (или «домой» при доставке) */
type OrderLink = { slug: string; label: string };

function DeliveryLink({ link }: { link?: OrderLink }) {
  if (!link) return null;
  return (
    <Link href={`/delivery/${link.slug}`} className="mt-2 inline-block text-sm font-semibold text-berry hover:text-berry-hover">
      {link.label}
    </Link>
  );
}

function HallDishCard({ dish, orderLink }: { dish: Dish; orderLink?: OrderLink }) {
  const weight = dishWeight(dish);
  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-fill">
        <Image src={dish.image!} alt={dish.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[17px] font-semibold">{dish.name}</h3>
        <span className="shrink-0 text-[17px] font-bold">{formatPrice(dish.priceFrom)}</span>
      </div>
      {weight && <div className="-mt-2 text-xs text-muted">{weight}</div>}
      {dish.description && <p className="text-sm leading-relaxed text-muted">{dish.description}</p>}
      <DeliveryLink link={orderLink} />
    </article>
  );
}

/** Блюдо без фото — строка «название ……… выход / цена», как в бумажном меню */
function HallDishRow({ dish, orderLink }: { dish: Dish; orderLink?: OrderLink }) {
  const weight = dishWeight(dish);
  return (
    <li>
      <div className="flex items-baseline gap-2 text-[17px]">
        <h3 className="font-semibold">{dish.name}</h3>
        <span className="mb-1 min-w-6 flex-1 border-b-2 border-dotted border-muted/25" aria-hidden />
        <span className="shrink-0 whitespace-nowrap">
          {weight && <span className="text-muted">{weight} / </span>}
          <span className="font-bold">{formatPrice(dish.priceFrom)}</span>
        </span>
      </div>
      {dish.description && <p className="mt-1 text-sm leading-relaxed text-muted">{dish.description}</p>}
      <DeliveryLink link={orderLink} />
    </li>
  );
}
