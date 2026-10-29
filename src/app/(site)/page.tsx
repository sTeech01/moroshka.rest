import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { DishCardMinimal } from "@/components/menu/dish-card";
import { PageHero } from "@/components/page-hero";
import { Highlight, RECORD_LOGO } from "@/components/page-sections";
import { HomePromos } from "@/components/promo-banners";
import { ScrollStage, StageScene } from "@/components/scroll-stage";
import { YandexMap } from "@/components/yandex-map";
import { features } from "@/config/site";
import { getDelivery, getHome, getPage, getPromos, getSettings } from "@/lib/content";
import { orderSection } from "@/lib/delivery";
import { formatPrice, formatTimeRange, formatWeekdaysFull, formatWeight } from "@/lib/format";
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

      {/* Сцена: фон с морошкой закреплён на весь экран, по прокрутке сменяются предложения → кухня и бар → блюда */}
      <ScrollStage>
        {promos.length > 0 && (
          <StageScene label="Предложения ресторана">
            <HomePromos promos={promos} />
          </StageScene>
        )}

        <StageScene label="Кухня и бар">
          <div className="container-site">
            <p className="eyebrow mb-6 text-berry lg:mb-8">Кухня и бар</p>
            <div className="grid grid-cols-2 gap-3 lg:gap-6">
              {[
                { title: "Кухня", text: home.kitchenText, image: home.kitchenImage, href: "/menu" },
                { title: "Бар", text: home.barText, image: home.barImage, href: "/bar-menu" },
              ].map((tile, i) => (
                // Плитки-«листья»: скругления зеркальны, вторая чуть ниже. Высота — по ширине (4:3 на компьютере), а не фиксированные 520 px
                <Link
                  key={tile.title}
                  href={tile.href}
                  className={`group relative block aspect-[4/5] overflow-hidden shadow-(--shadow-soft) sm:aspect-[4/3] lg:aspect-[16/11] ${i ? "shape-leaf-alt lg:mt-8" : "shape-leaf"}`}
                >
                  {tile.image && (
                    <Image src={tile.image.url} alt="" fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-night/90 via-night/55 to-transparent p-4 pt-14 lg:p-8 lg:pt-24">
                    <div>
                      <div className="h-display text-[22px] lg:text-[40px]">{tile.title}</div>
                      {tile.text && <div className="mt-1.5 hidden text-soft lg:block">{tile.text}</div>}
                    </div>
                    <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-snow/10 text-xl text-berry backdrop-blur-sm transition-[background-color,transform] duration-300 group-hover:translate-x-1 group-hover:bg-snow/15 lg:grid" aria-hidden>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </StageScene>

        <StageScene className="stage-last">
          {ordering ? (
            <DeliveryDishes menu={menu} featuredIds={home.featuredDishes} section={orderSection(delivery)} />
          ) : (
            <SignatureDishes hall={hall} />
          )}
        </StageScene>
      </ScrollStage>

      {/* Вторая сцена — на фоне стены ресторана из мха и камня: рекорд → бронь → как нас найти */}
      <ScrollStage bg="moss">
        {/* Рекорд России — регалия ресторана, как у других «Мишлен» */}
        {record?.kind === "highlight" && (
          <StageScene id="record">
            <div className="container-site">
              <Highlight section={record} layout="split" />
            </div>
          </StageScene>
        )}

        {/* Бронь — по референсу заказчика: слева текст прямо на фоне сцены, справа форма
            в компактной «стеклянной» карточке (поля не растягиваются на пол-экрана) */}
        <StageScene id="booking">
          <section
            aria-label="Бронь стола"
            className="container-site grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_600px] xl:gap-20"
          >
            <div>
              <p className="eyebrow text-berry">Бронь</p>
              <h2 className="h-display mt-5 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[2.75rem] xl:text-[4.25rem]">
                Забронировать
                <br />
                стол
              </h2>
              <span aria-hidden className="mt-7 block h-px w-10 bg-berry/80" />
              <div className="mt-6 text-[17px] leading-[1.45] font-light text-soft lg:text-lg">
                {settings.hours.map((h) => (
                  <p key={h.days}>
                    {h.days}: {h.time}
                  </p>
                ))}
              </div>
              <p className="mt-5 text-[17px] font-light text-soft lg:text-lg">
                Или позвоните:{" "}
                <a href={`tel:${tel}`} className="ml-1 font-medium whitespace-nowrap text-snow transition-colors hover:text-berry">
                  {settings.phone}
                </a>
              </p>
            </div>
            <div className="booking-glass rounded-[28px] p-5 sm:p-8">
              <BookingForm kind="table" />
            </div>
          </section>
        </StageScene>

        {/* Контакты — по референсу заказчика: слева крупный светлый заголовок, адрес, телефон,
            часы работы и реквизиты; справа большая карта в тёмной теме сайта */}
        {geo && (
          <StageScene className="stage-last">
            <section aria-label="Контакты" className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="h-display text-[2.75rem] text-snow/85 uppercase lg:text-[3.25rem]">Контакты</h2>
                <div className="mt-6 text-[19px] leading-[1.35] font-light lg:mt-8 lg:text-[22px]">
                  <p>{settings.address}</p>
                  <p>Ресторан «Морошка»</p>
                  <p>
                    <a href={`tel:${tel}`} className="transition-colors hover:text-berry">
                      {settings.phone}
                    </a>
                  </p>
                  {settings.email && (
                    <p>
                      <a href={`mailto:${settings.email}`} className="transition-colors hover:text-berry">
                        {settings.email}
                      </a>
                    </p>
                  )}
                </div>
                <p className="mt-6 text-[17px] font-light text-lichen uppercase lg:mt-7 lg:text-xl">Время работы:</p>
                <div className="mt-1 text-[17px] leading-[1.35] font-light text-soft lg:text-[21px]">
                  {settings.hours.map((h) => (
                    <p key={h.days}>
                      {formatWeekdaysFull(h.days)} : {formatTimeRange(h.time)}
                    </p>
                  ))}
                </div>
                {settings.legal && <p className="mt-6 max-w-md text-[15px] leading-snug font-light text-lichen/80 lg:mt-8 lg:text-base">{settings.legal}</p>}
              </div>
              <YandexMap
                lat={geo.lat}
                lng={geo.lng}
                className="aspect-[700/625] w-full rounded-lg! lg:aspect-auto lg:h-[min(625px,calc(100svh-11rem))]"
              />
            </section>
          </StageScene>
        )}
      </ScrollStage>
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
    <section className="container-site">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Кухня Ямала</p>
          <h2 className="h-display mt-5 text-4xl lg:text-[56px]">Север на тарелке</h2>
        </div>
        <Link href="/menu" className="text-sm font-semibold tracking-wide text-berry transition-colors hover:text-berry-hover">
          Всё меню →
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-6">
        {picked.map(({ dish, category }) => {
          const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
          const weight = formatWeight(size.weight, dish.measureUnit);
          return (
            <Link key={dish.id} href={`/menu#${category}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-fill">
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
    <section className="container-site">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{section.homeEyebrow}</p>
          <h2 className="h-display mt-5 text-4xl lg:text-[56px]">{section.homeTitle}</h2>
        </div>
        <Link href="/delivery" className="text-sm font-semibold tracking-wide text-berry transition-colors hover:text-berry-hover">
          {section.homeLink}
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-6">
        {featured.map((d) => (
          <DishCardMinimal key={d.id} dish={d} />
        ))}
      </div>
    </section>
  );
}
