import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MenuTabs } from "@/components/menu-tabs";
import { PlusIcon, QuickAdd } from "@/components/menu/quick-add";
import { MenuPromos } from "@/components/promo-banners";
import { features } from "@/config/site";
import { getDelivery, getPromos, getSettings } from "@/lib/content";
import { PICKUP_LEAD_MINUTES } from "@/lib/delivery";
import { formatPrice, formatWeight } from "@/lib/format";
import { getHallMenu } from "@/lib/menu/get-menu";
import type { Dish } from "@/lib/menu/types";

export const metadata: Metadata = {
  title: "Меню ресторана",
  description:
    "Меню ресторана «Морошка» в Губкинском: салаты, северные закуски, строганина и рубанина, супы, оленина и муксун, пасты неро, десерты. Закажите на сайте и заберите в ресторане.",
  alternates: { canonical: "/menu" },
};

/**
 * Меню зала. Блюда, которые есть в меню заказа на сайте (тот же ID в iiko, не в стоп-листе),
 * кладутся в корзину прямо отсюда кнопкой «+», а по нажатию на фото или название открываются
 * на своей странице — описание и заказ. Как это работает, объясняет панель «Самовывоз» вверху.
 */
export default async function MenuPage() {
  const [menu, delivery, promos, settings] = await Promise.all([getHallMenu(), getDelivery(), getPromos("menu"), getSettings()]);
  // Заказ на сайте — когда включены онлайн-заказы и в админке есть доставка или самовывоз
  const ordering = features.onlineOrders && (delivery.enabled || delivery.pickupEnabled);
  const orderable = ordering ? menu.orderable : {};

  return (
    <div className="theme-paper">
      <div className="container-site pt-10 pb-24 lg:pt-14 lg:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Кухня ресторана</p>
            <h1 className="h-display mt-4 text-5xl lg:text-7xl">Меню</h1>
            <MenuTabs active="kitchen" />
          </div>
          <Link href="/#booking" className="btn btn-line btn-sm">
            Забронировать стол
          </Link>
        </div>

        {ordering ? (
          <OrderHowTo address={settings.address} delivery={delivery.enabled} />
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
          className="chip-rail z-30 mt-8 flex gap-2 overflow-x-auto rounded-card bg-surface/90 p-2.5 shadow-(--shadow-soft) backdrop-blur-md lg:sticky lg:top-[88px] lg:flex-wrap lg:overflow-visible"
        >
          {menu.categories.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="pill pill-compact shrink-0">
              {c.name}
            </a>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-12 lg:gap-14">
          {menu.categories.map((c) => {
            const withPhoto = c.dishes.filter((d) => d.image);
            const rest = c.dishes.filter((d) => !d.image);
            return (
              <section key={c.id} id={c.slug} className="scroll-mt-24 lg:scroll-mt-40">
                <h2 className="h-display text-4xl">{c.name}</h2>
                {withPhoto.length > 0 && (
                  <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {withPhoto.map((d) => (
                      <HallDishCard key={d.id} dish={d} order={orderable[d.id]} />
                    ))}
                  </div>
                )}
                {rest.length > 0 && (
                  <ul className={`grid gap-x-12 gap-y-6 lg:grid-cols-2 ${withPhoto.length ? "mt-10" : "mt-7"}`}>
                    {rest.map((d) => (
                      <HallDishRow key={d.id} dish={d} order={orderable[d.id]} />
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

/** Как заказать: тёмная панель с тремя шагами — «+» у блюда, оформить, забрать */
function OrderHowTo({ address, delivery }: { address: string; delivery: boolean }) {
  const steps = [
    { title: "Выберите блюда", text: "Нажмите «+» у блюда — оно в корзине. Нажмите на фото — откроется описание." },
    { title: "Оформите заказ", text: delivery ? "Укажите адрес и удобное время." : "Укажите имя, телефон и время, к которому приготовить." },
    delivery
      ? { title: "Получите заказ", text: "Привезём по Губкинскому или заберите сами в ресторане." }
      : { title: "Заберите в ресторане", text: `${address}. Обычно готово через ${PICKUP_LEAD_MINUTES} минут.` },
  ];
  return (
    <section aria-labelledby="order-howto" className="surface-moss mt-8 rounded-card px-6 py-7 text-snow sm:px-8 lg:px-10 lg:py-9">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-12">
        <div>
          <p className="text-xs tracking-[0.24em] text-berry uppercase">{delivery ? "Доставка и самовывоз" : "Самовывоз"}</p>
          <h2 id="order-howto" className="h-display mt-3 text-[28px] leading-tight lg:text-[32px]">
            Закажите из меню{" "}— {delivery ? "привезём или заберёте сами" : "заберите сами"}
          </h2>
          <p className="mt-3 flex items-center gap-2.5 text-sm text-lichen">
            <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-berry text-night">
              <PlusIcon strokeWidth={2} />
            </span>
            так отмечены блюда, которые можно заказать
          </p>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-8">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t border-snow/15 pt-4">
              <span className="font-display text-sm text-berry tabular-nums">0{i + 1}</span>
              <h3 className="mt-1.5 text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-lichen">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-[13px] text-lichen/75">Цены на заказ с собой могут отличаться от цен в зале — в корзине видна точная сумма.</p>
    </section>
  );
}

function dishWeight(dish: Dish) {
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  return formatWeight(size.weight, dish.measureUnit);
}

/** «+» в корзину; блюдо с обязательным выбором (размер, соус) — «+» ведёт на его страницу */
function AddToCart({ order }: { order: Dish }) {
  if (order.requiresChoice)
    return (
      <Link
        href={`/delivery/${order.slug}`}
        aria-label={`Выбрать и заказать: ${order.name}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-berry text-night transition-colors duration-200 hover:bg-berry-hover"
      >
        <PlusIcon strokeWidth={2} />
      </Link>
    );
  return <QuickAdd dish={order} variant="solid" />;
}

/** Цена с собой — только если отличается от цены в зале */
function TakeawayPrice({ dish, order }: { dish: Dish; order?: Dish }) {
  if (!order || order.priceFrom === dish.priceFrom) return null;
  return (
    <span className="text-muted">
      {" "}· с собой {order.sizes.length > 1 ? "от " : ""}
      {formatPrice(order.priceFrom)}
    </span>
  );
}

function HallDishCard({ dish, order }: { dish: Dish; order?: Dish }) {
  const weight = dishWeight(dish);
  const href = order && `/delivery/${order.slug}`;
  const photo = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-fill">
      <Image
        src={dish.image!}
        alt={dish.name}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.04]"
      />
    </div>
  );
  return (
    <article className="flex flex-col gap-3">
      {/* «+» лежит в углу фото: название и цена под фото остаются во всю ширину, даже со счётчиком */}
      <div className="relative">
        {href ? (
          <Link href={href} className="group block" tabIndex={-1} aria-hidden>
            {photo}
          </Link>
        ) : (
          photo
        )}
        {order && (
          <div className="absolute right-3 bottom-3 rounded-full shadow-[0_10px_24px_-8px_rgb(0_0_0/0.55)]">
            <AddToCart order={order} />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[17px] leading-snug font-semibold">
          {href ? (
            <Link href={href} className="transition-colors hover:text-berry">
              {dish.name}
            </Link>
          ) : (
            dish.name
          )}
        </h3>
        <p className="mt-1 text-[13px]">
          {weight && <span className="text-muted">{weight} · </span>}
          <span className="text-[15px] font-bold">{formatPrice(dish.priceFrom)}</span>
          <TakeawayPrice dish={dish} order={order} />
        </p>
      </div>
      {dish.description && <p className="line-clamp-3 text-sm leading-relaxed text-muted">{dish.description}</p>}
    </article>
  );
}

/** Блюдо без фото — строка «название ……… выход / цена», как в бумажном меню, и «+» справа */
function HallDishRow({ dish, order }: { dish: Dish; order?: Dish }) {
  const weight = dishWeight(dish);
  return (
    <li className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 text-[17px]">
          <h3 className="font-semibold">
            {order ? (
              <Link href={`/delivery/${order.slug}`} className="transition-colors hover:text-berry">
                {dish.name}
              </Link>
            ) : (
              dish.name
            )}
          </h3>
          <span className="mb-1 min-w-6 flex-1 border-b-2 border-dotted border-muted/25" aria-hidden />
          <span className="shrink-0 whitespace-nowrap">
            {weight && <span className="text-muted">{weight} / </span>}
            <span className="font-bold">{formatPrice(dish.priceFrom)}</span>
          </span>
        </div>
        {dish.description && <p className="mt-1 text-sm leading-relaxed text-muted">{dish.description}</p>}
        {order && order.priceFrom !== dish.priceFrom && (
          <p className="mt-1 text-[13px] text-muted">
            С собой {order.sizes.length > 1 ? "от " : ""}
            {formatPrice(order.priceFrom)}
          </p>
        )}
      </div>
      {order ? <AddToCart order={order} /> : <span aria-hidden className="w-10 shrink-0" />}
    </li>
  );
}
