import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { DishCardMinimal } from "@/components/menu/dish-card";
import { PageHero } from "@/components/page-hero";
import { Highlight, RECORD_LOGO } from "@/components/page-sections";
import { HomePromos } from "@/components/promo-banners";
import { YandexMap, yandexRouteUrl } from "@/components/yandex-map";
import { features } from "@/config/site";
import { getDelivery, getHome, getPage, getPromos, getSettings } from "@/lib/content";
import { orderSection } from "@/lib/delivery";
import { formatPrice, formatWeight } from "@/lib/format";
import { getHallMenu, getMenu } from "@/lib/menu/get-menu";
import type { Dish } from "@/lib/menu/types";

// Фирменные блюда кухни — для блока на главной, пока нет онлайн-заказов (ищутся в меню зала по названию)
const SIGNATURE = ["рубанина", "ребро ямальского оленя", "филе муксуна", "ямальские ягоды"];

export default async function HomePage() {
  const [home, settings, menu, hall, promos, about, delivery] = await Promise.all([
    getHome(),
    getSettings(),
    getMenu(),
    getHallMenu(),
    getPromos("home"),
    getPage("about"),
    getDelivery(),
  ]);
  // Заказ на сайте: доставка и/или самовывоз (настраивается в админке); сейчас — только самовывоз
  const ordering = features.onlineOrders && (delivery.enabled || delivery.pickupEnabled);

  // Рекорд России — секция «Событие с цифрами» со страницы «О ресторане» (правится в админке там же)
  const record = about?.sections.find((s) => s.kind === "highlight");

  const tel = settings.phone.replace(/[^\d+]/g, "");
  // «г. Губкинский, мкр. 13, д. 80» → город и остальное, для вывода в две строки
  const [addressCity, ...addressParts] = settings.address.split(", ");
  const addressRest = addressParts.join(", ");
  const geo = settings.geo.lat && settings.geo.lng ? { lat: settings.geo.lat, lng: settings.geo.lng } : null;

  return (
    <>
      {/* Первый экран — общий с банкетами (PageHero). Под кнопками: часы работы | адрес */}
      {/* Фон — видео интерьера со старого сайта (19 с, по кругу). Исходник: design/video */}
      <PageHero
        image={home.heroImage}
        video={{ src: "/video/hero.mp4", poster: "/video/hero-poster.webp", alt: "Интерьер ресторана «Морошка»: стена из мха, дерево, бар" }}
        badge={record ? { label: "Рекорд России · 2026", href: "/#record", logo: RECORD_LOGO } : undefined}
        eyebrow="Ресторан · Губкинский"
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        actions={[
          { href: "/menu", label: features.onlineOrders && delivery.enabled ? "Меню и доставка" : "Меню", primary: true },
          { href: "#booking", label: "Забронировать стол" },
        ]}
        info={{
          left: settings.hours.map((h) => `${h.days}  ${h.time}`),
          // Адрес в две строки: «г. Губкинский,» / «мкр. 13, д. 80» — перенос после первой запятой
          right: addressRest ? [`${addressCity},`, addressRest] : [addressCity],
        }}
        phone={settings.phone}
      />

      <HomePromos promos={promos} />

      {/* Кухня и бар */}
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

      {ordering ? (
        <DeliveryDishes menu={menu} featuredIds={home.featuredDishes} section={orderSection(delivery)} />
      ) : (
        <SignatureDishes hall={hall} />
      )}

      {/* Рекорд России — регалия ресторана, как у других «Мишлен» */}
      {record?.kind === "highlight" && (
        <div id="record" className="container-site scroll-mt-24 pt-20 lg:scroll-mt-28 lg:pt-30">
          <Highlight section={record} />
        </div>
      )}

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

      {/* Как нас найти — Яндекс Карта */}
      {geo && (
        <section className="container-site grid gap-6 pb-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10 lg:pb-30">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Как нас найти</p>
            <h2 className="h-display mt-4 text-4xl lg:text-5xl">{settings.address}</h2>
            <div className="mt-6 space-y-1 text-[17px] text-soft">
              {settings.hours.map((h) => (
                <p key={h.days}>
                  {h.days}: {h.time}
                </p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={yandexRouteUrl(geo.lat, geo.lng)} target="_blank" rel="noopener noreferrer" className="btn btn-berry btn-sm">
                Построить маршрут
              </a>
              <a href={`tel:${tel}`} className="btn btn-line btn-sm">
                {settings.phone}
              </a>
            </div>
          </div>
          <YandexMap lat={geo.lat} lng={geo.lng} className="h-[320px] lg:h-[440px]" />
        </section>
      )}
    </>
  );
}

/** Фирменные блюда из меню зала — витрина без корзины (пока нет онлайн-заказов) */
function SignatureDishes({ hall }: { hall: Awaited<ReturnType<typeof getHallMenu>> }) {
  const all = hall.categories.flatMap((c) => c.dishes.map((d) => ({ dish: d, category: c.slug })));
  const byName = SIGNATURE.map((n) => all.find(({ dish }) => dish.image && dish.name.toLowerCase().includes(n))).filter(
    (x): x is (typeof all)[number] => x !== undefined,
  );
  // Не нашлось по названиям (меню поменяли) — по одному блюду с фото из разных разделов
  const picked =
    byName.length >= 4
      ? byName
      : hall.categories
          .map((c) => c.dishes.find((d) => d.image))
          .filter((d): d is Dish => d !== undefined)
          .map((dish) => ({ dish, category: hall.categories.find((c) => c.id === dish.categoryId)?.slug ?? "" }))
          .slice(0, 4);

  return (
    <section className="container-site pt-20 lg:pt-30">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Кухня Ямала</p>
          <h2 className="h-display mt-5 text-4xl lg:text-[56px]">Север на тарелке</h2>
        </div>
        <Link href="/menu" className="border-b border-border pb-1 text-sm tracking-wide text-soft transition-colors hover:border-berry hover:text-berry">
          Всё меню →
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
        {picked.map(({ dish, category }) => {
          const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
          const weight = formatWeight(size.weight, dish.measureUnit);
          return (
            <Link key={dish.id} href={`/menu#${category}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-fill">
                <Image
                  src={dish.image!}
                  alt={dish.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 line-clamp-2 text-[15px] leading-snug transition-colors group-hover:text-berry">{dish.name}</div>
              <div className="mt-1.5 text-[13px] tracking-wide text-muted">
                {weight && <>{weight} · </>}
                <span className="text-soft">{formatPrice(dish.priceFrom)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Популярные блюда для заказа на сайте (доставка или самовывоз) с кнопкой «в корзину» */
function DeliveryDishes({
  menu,
  featuredIds,
  section,
}: {
  menu: Awaited<ReturnType<typeof getMenu>>;
  featuredIds: string[];
  section: ReturnType<typeof orderSection>;
}) {
  // Популярные блюда выбираются в админке (Главная → «Популярные блюда»).
  // Блюда из стоп-листа и удалённые из меню пропускаются. Пусто — по одному блюду с фото из разных разделов
  const dishes = menu.categories.flatMap((c) => c.dishes);
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const picked = featuredIds.map((id) => byId.get(id)).filter((d): d is Dish => d !== undefined && d.inStock);
  const fallback = menu.categories
    .map((c) => c.dishes.find((d) => d.inStock && d.image && d.measureUnit !== "мл"))
    .filter((d): d is Dish => d !== undefined)
    .slice(0, 4);
  const featured = picked.length > 0 ? picked : fallback;

  return (
    <section className="container-site pt-20 lg:pt-30">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{section.homeEyebrow}</p>
          <h2 className="h-display mt-5 text-4xl lg:text-[56px]">{section.homeTitle}</h2>
        </div>
        <Link href="/delivery" className="border-b border-border pb-1 text-sm tracking-wide text-soft transition-colors hover:border-berry hover:text-berry">
          {section.homeLink}
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
        {featured.map((d) => (
          <DishCardMinimal key={d.id} dish={d} />
        ))}
      </div>
    </section>
  );
}
