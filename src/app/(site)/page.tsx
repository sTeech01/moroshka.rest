import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { DishCardMinimal } from "@/components/menu/dish-card";
import { PageHero } from "@/components/page-hero";
import { HomePromos } from "@/components/promo-banners";
import { getHome, getPromos, getSettings } from "@/lib/content";
import { getMenu } from "@/lib/menu/get-menu";
import type { Dish } from "@/lib/menu/types";

export default async function HomePage() {
  const [home, settings, menu, promos] = await Promise.all([getHome(), getSettings(), getMenu(), getPromos("home")]);

  // Популярные блюда выбираются в админке (Главная → «Популярные блюда»).
  // Блюда из стоп-листа и удалённые из меню пропускаются. Пусто — по одному блюду с фото
  // из разных разделов (без напитков), чтобы на главной не было заглушек и четырёх супов подряд
  const dishes = menu.categories.flatMap((c) => c.dishes);
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const picked = home.featuredDishes.map((id) => byId.get(id)).filter((d): d is Dish => d !== undefined && d.inStock);
  const fallback = menu.categories
    .map((c) => c.dishes.find((d) => d.inStock && d.image && d.measureUnit !== "мл"))
    .filter((d): d is Dish => d !== undefined)
    .slice(0, 4);
  const featured = picked.length > 0 ? picked : fallback;
  const tel = settings.phone.replace(/[^\d+]/g, "");
  // «г. Губкинский, мкр. 13, д. 80» → город и остальное, для вывода в две строки
  const [addressCity, ...addressParts] = settings.address.split(", ");
  const addressRest = addressParts.join(", ");

  return (
    <>
      {/* Первый экран — общий с банкетами (PageHero). Под кнопками: часы работы | адрес */}
      <PageHero
        image={home.heroImage}
        eyebrow="Ресторан · Губкинский"
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        actions={[
          { href: "/menu", label: "Меню и доставка", primary: true },
          { href: "#booking", label: "Забронировать стол" },
        ]}
        info={{
          left: settings.hours.map((h) => `${h.days}  ${h.time}`),
          // Адрес в две строки: «г. Губкинский,» / «мкр. 13, д. 80» — перенос после первой запятой
          right: addressRest ? [`${addressCity},`, addressRest] : [addressCity],
        }}
        phone={settings.phone}
      />

      <HomePromos promos={promos} />

      {/* Кухня и бар. Блок «О ресторане» с главной убран — он есть на /about и в меню шапки */}
      <section className="container-site mt-20 grid grid-cols-2 gap-2.5 lg:mt-30 lg:gap-4">
        {[
          { title: "Кухня", text: home.kitchenText, image: home.kitchenImage },
          { title: "Бар", text: home.barText, image: home.barImage },
        ].map((tile) => (
          <Link key={tile.title} href="/menu" className="group relative block h-52 overflow-hidden lg:h-[520px]">
            {tile.image && (
              <Image src={tile.image.url} alt="" fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-night/80 p-4 lg:p-8">
              <div>
                <div className="h-display text-[22px] lg:text-[40px]">{tile.title}</div>
                {tile.text && <div className="mt-1.5 hidden text-soft lg:block">{tile.text}</div>}
              </div>
              <span className="hidden text-3xl text-berry lg:block" aria-hidden>→</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Доставка */}
      <section className="container-site pt-20 lg:pt-30">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Доставка из ресторана</p>
            <h2 className="h-display mt-5 text-4xl lg:text-[56px]">Северная кухня дома</h2>
          </div>
          <Link href="/delivery" className="border-b border-border pb-1 text-sm tracking-wide text-soft transition-colors hover:border-berry hover:text-berry">
            Все блюда с доставкой →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((d) => (
            <DishCardMinimal key={d.id} dish={d} />
          ))}
        </div>
      </section>

      <Image
        src="/images/berries.webp"
        alt=""
        aria-hidden
        width={2000}
        height={262}
        className="mt-20 h-20 w-full object-cover object-top opacity-30 lg:mt-30 lg:h-30"
      />

      {/* Бронь */}
      {/* Компактно: по ссылке «Забронировать стол» (/#booking) заголовок и вся форма с кнопкой — в одном экране */}
      <section id="booking" className="container-site grid gap-10 py-14 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:py-16">
        <div>
          <p className="eyebrow">Бронь</p>
          <h2 className="h-display mt-4 text-4xl lg:text-5xl">Забронировать стол</h2>
          <div className="mt-6 space-y-1 text-[17px]">
            {settings.hours.map((h) => (
              <p key={h.days}>
                {h.days}: {h.time}
              </p>
            ))}
          </div>
          <p className="mt-6 text-muted">
            Или позвоните:{" "}
            <a href={`tel:${tel}`} className="font-semibold text-text hover:text-berry">
              {settings.phone}
            </a>
          </p>
        </div>
        <BookingForm kind="table" />
      </section>
    </>
  );
}
