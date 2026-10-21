import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DISH_PLACEHOLDER, DishImage } from "@/components/menu/dish-image";
import { DishOptions } from "@/components/menu/dish-options";
import { siteConfig } from "@/config/site";
import { formatPrice, formatWeight } from "@/lib/format";
import { getDelivery } from "@/lib/content";
import { orderSection } from "@/lib/delivery";
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

// Каркас страницы показывается сразу при переходе, данные блюда подставляются следом
export default function DishPage({ params }: PageProps<"/delivery/[slug]">) {
  return (
    <Suspense fallback={<DishSkeleton />}>
      <Dish params={params} />
    </Suspense>
  );
}

function DishSkeleton() {
  return (
    <div className="container-site pt-6 pb-16 md:py-12" aria-busy>
      <div className="h-11 w-40 animate-pulse bg-fill" />
      <div className="mt-6 grid gap-8 md:mt-10 md:grid-cols-2 md:gap-14">
        <div className="aspect-[4/3] animate-pulse bg-fill" />
        <div className="space-y-4">
          <div className="h-12 w-3/4 animate-pulse bg-fill" />
          <div className="h-5 w-1/2 animate-pulse bg-fill" />
          <div className="h-8 w-24 animate-pulse bg-fill" />
        </div>
      </div>
    </div>
  );
}

async function Dish({ params }: { params: PageProps<"/delivery/[slug]">["params"] }) {
  const { slug } = await params;
  const [dish, menu, delivery] = await Promise.all([getDishBySlug(slug), getMenu(), getDelivery()]);
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
    <div className="container-site pt-6 pb-16 md:py-12">
      <nav aria-label="Навигация" className="flex items-center gap-3 text-sm text-muted">
        <Link href="/delivery" className="grid h-11 w-11 place-items-center rounded-full border border-border hover:text-text" aria-label={`Назад: ${section.label}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <Link href="/delivery" className="hover:text-text">{section.label}</Link>
        {category && (
          <>
            <span aria-hidden>·</span>
            <Link href={`/delivery#${category.slug}`} className="hover:text-text">{category.name}</Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 md:mt-10 md:grid-cols-2 md:gap-14">
        <div className="-mx-4 sm:mx-0">
          <DishImage src={dish.image} alt={dish.name} sizes="(min-width: 768px) 50vw, 100vw" priority />
        </div>
        <div>
          <h1 className="h-display text-4xl md:text-5xl">{dish.name}</h1>
          {weight && <div className="mt-3 text-sm text-muted">{weight}</div>}
          {dish.description && <p className="mt-3 text-[15px] leading-relaxed text-soft md:text-[17px]">{dish.description}</p>}
          <div className="mt-5 text-2xl font-bold">
            {dish.sizes.length > 1 ? "от " : ""}
            {formatPrice(dish.priceFrom)}
          </div>
          <div className="mt-8">
            <DishOptions dish={dish} />
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
