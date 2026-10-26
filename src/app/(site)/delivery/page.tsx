import type { Metadata } from "next";
import Link from "next/link";
import { CartSummary } from "@/components/cart/cart-summary";
import { CmsContent } from "@/components/cms-content";
import { DishCard } from "@/components/menu/dish-card";
import { MenuPromos } from "@/components/promo-banners";
import { getDelivery, getPage, getPromos, getSettings } from "@/lib/content";
import { orderSection } from "@/lib/delivery";
import { getMenu } from "@/lib/menu/get-menu";

export async function generateMetadata(): Promise<Metadata> {
  const delivery = await getDelivery();
  return delivery.enabled
    ? {
        title: "Доставка",
        description: `Доставка блюд ресторана «Морошка» по Губкинскому от ${delivery.minOrderSum} ₽: северная кухня, супы, горячее, десерты. Самовывоз.`,
        alternates: { canonical: "/delivery" },
      }
    : {
        title: "Самовывоз",
        description: "Закажите блюда ресторана «Морошка» на сайте и заберите в ресторане в Губкинском: северная кухня, супы, горячее, десерты.",
        alternates: { canonical: "/delivery" },
      };
}

/**
 * Заказ на сайте (меню доставки из iiko). Пока доставка выключена в админке — это «Самовывоз»:
 * заказ на сайте, забрать в ресторане. Условия доставки из CMS показываются, только когда есть доставка.
 */
export default async function DeliveryPage() {
  const [menu, delivery, promos, terms, settings] = await Promise.all([
    getMenu(),
    getDelivery(),
    getPromos("menu"),
    getPage("delivery"),
    getSettings(),
  ]);
  const section = orderSection(delivery);
  const showTerms = delivery.enabled && Boolean(terms?.content);

  return (
    <div className="theme-paper">
      <div className="container-site pt-12 pb-24 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">
              {delivery.enabled
                ? `По Губкинскому от ${delivery.minOrderSum} ₽${delivery.pickupEnabled ? " · самовывоз" : ""}`
                : `Закажите на сайте — заберите в ресторане · ${settings.address}`}
            </p>
            <h1 className="h-display mt-4 text-5xl lg:text-7xl">{section.title}</h1>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {showTerms && (
              <a href="#usloviya" className="text-muted hover:text-text">
                Условия доставки
              </a>
            )}
            <Link href="/menu" className="text-berry hover:text-berry-hover">
              Полное меню ресторана →
            </Link>
          </div>
        </div>

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

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-16">
            {menu.categories.map((c) => (
              <section key={c.id} id={c.slug} className="scroll-mt-24 lg:scroll-mt-40">
                <h2 className="h-display text-4xl">{c.name}</h2>
                <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {c.dishes.map((d) => (
                    <DishCard key={d.id} dish={d} />
                  ))}
                </div>
              </section>
            ))}

            {showTerms && terms?.content && (
              <section id="usloviya" className="card-soft scroll-mt-24 p-7 lg:scroll-mt-40 lg:p-10">
                <h2 className="h-display text-4xl">{terms.title}</h2>
                <div className="mt-6 max-w-3xl">
                  <CmsContent data={terms.content} />
                </div>
              </section>
            )}
          </div>
          {/* Колонка на всю высоту меню — иначе корзине (sticky) не к чему прилипать */}
          <div className="hidden self-stretch lg:block">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
