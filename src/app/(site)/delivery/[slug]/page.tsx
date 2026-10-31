import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DISH_PLACEHOLDER, DishImage } from "@/components/menu/dish-image";
import { BackButton } from "@/components/menu/back-button";
import { DishOptions } from "@/components/menu/dish-options";
import { siteConfig } from "@/config/site";
import { formatPrice, formatWeight } from "@/lib/format";
import { getDelivery, getSettings } from "@/lib/content";
import { orderSection, PICKUP_LEAD_MINUTES } from "@/lib/delivery";
import { getDishBySlug, getMenu } from "@/lib/menu/get-menu";

export async function generateStaticParams() {
  const menu = await getMenu();
  return menu.categories.flatMap((c) => c.dishes.map((d) => ({ slug: d.slug })));
}

export async function generateMetadata({ params }: PageProps<"/delivery/[slug]">): Promise<Metadata> {
  const [dish, delivery] = await Promise.all([getDishBySlug((await params).slug), getDelivery()]);
  if (!dish) return {};
  return {
    title: `${dish.name} — ${delivery.enabled ? "доставка" : "с собой"} в Губкинском`,
    description:
      dish.description ||
      `${dish.name} от ${formatPrice(dish.priceFrom)} ${delivery.enabled ? "с доставкой по Губкинскому" : "— закажите на сайте и заберите в ресторане"}.`,
    alternates: { canonical: `/delivery/${dish.slug}` },
    openGraph: { images: [dish.image ?? DISH_PLACEHOLDER] },
  };
}

// Каркас страницы показывается сразу при переходе, данные блюда подставляются следом.
// Страница светлая, как меню, из которого на неё приходят
export default function DishPage({ params }: PageProps<"/delivery/[slug]">) {
  return (
    <div className="theme-paper">
      <Suspense fallback={<DishSkeleton />}>
        <Dish params={params} />
      </Suspense>
    </div>
  );
}

function DishSkeleton() {
  return (
    <div className="container-site pt-6 pb-16 md:py-12" aria-busy>
      <div className="skeleton h-11 w-40" />
      <div className="mt-6 grid gap-8 md:mt-10 md:grid-cols-2 md:gap-14">
        <div className="skeleton aspect-[4/3] rounded-card" />
        <div className="space-y-4">
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

async function Dish({ params }: { params: PageProps<"/delivery/[slug]">["params"] }) {
  const { slug } = await params;
  const [dish, menu, delivery, settings] = await Promise.all([getDishBySlug(slug), getMenu(), getDelivery(), getSettings()]);
  if (!dish) notFound();
  const section = orderSection(delivery);

  const category = menu.categories.find((c) => c.id === dish.categoryId);
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  const weight = dish.sizes.length === 1 ? formatWeight(size.weight, dish.measureUnit) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: dish.image ?? undefined,
    offers: { "@type": "Offer", price: dish.priceFrom, priceCurrency: "RUB", url: `${siteConfig.url}/delivery/${dish.slug}` },
  };

  return (
    <div className="container-site pt-6 pb-16 md:pt-10 md:pb-20">
      <nav aria-label="Навигация" className="flex items-center gap-3 text-sm text-muted">
        <BackButton fallback="/menu" />
        <Link href="/menu" className="hover:text-text">Меню</Link>
        <span aria-hidden>·</span>
        <Link href="/delivery" className="hover:text-text">{section.label}</Link>
        {category && (
          <>
            <span aria-hidden>·</span>
            <Link href={`/delivery#${category.slug}`} className="hover:text-text">{category.name}</Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid items-start gap-8 md:mt-8 md:grid-cols-2 md:gap-14">
        <div className="md:sticky md:top-28">
          <DishImage src={dish.image} alt={dish.name} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
        <div className="md:pt-2">
          {category && <p className="eyebrow">{category.name}</p>}
          <h1 className="h-display mt-3 text-4xl md:text-5xl">{dish.name}</h1>
          <div className="mt-5 flex items-baseline gap-4">
            <span className="text-2xl font-bold">
              {dish.sizes.length > 1 ? "от " : ""}
              {formatPrice(dish.priceFrom)}
            </span>
            {weight && <span className="text-sm text-muted">{weight}</span>}
          </div>
          {dish.description && (
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-xs tracking-[0.2em] text-muted uppercase">Состав</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-soft md:text-[17px]">{dish.description}</p>
            </div>
          )}
          <div className="mt-7">
            <DishOptions dish={dish} />
          </div>
          {!delivery.enabled && (
            <div className="mt-6 flex gap-3.5 rounded-card bg-card p-5 text-sm leading-relaxed ring-1 ring-border ring-inset">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0 text-berry" aria-hidden>
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <p>
                <span className="font-semibold">Самовывоз из ресторана</span>
                <span className="block text-muted">
                  {settings.address}. Заказ обычно готов через {PICKUP_LEAD_MINUTES} минут — время можно выбрать при оформлении.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
