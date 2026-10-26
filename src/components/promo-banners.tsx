import Image from "next/image";
import Link from "next/link";
import type { PromoItem } from "@/lib/content";

function PromoLink({ promo, className }: { promo: PromoItem; className: string }) {
  if (!promo.linkUrl) return null;
  const external = /^https?:\/\//.test(promo.linkUrl);
  return external ? (
    <a href={promo.linkUrl} className={className} target="_blank" rel="noopener noreferrer">
      {promo.linkLabel}
    </a>
  ) : (
    <Link href={promo.linkUrl} className={className}>
      {promo.linkLabel}
    </Link>
  );
}

/** 64.436706 → «64°26′ с. ш.»; долгота — «в. д.» */
function formatCoord(value: number, kind: "lat" | "lng") {
  const deg = Math.floor(Math.abs(value));
  const min = Math.floor((Math.abs(value) - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′ ${kind === "lat" ? "с. ш." : "в. д."}`;
}

const index = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Предложения на главной — редакционная композиция на многослойном фоне (стили .promo-* в globals.css).
 * Первое промо — главная карточка с фото, выступающим за рамку; остальные — оливковые карточки
 * справа, смещённые вниз. Между ними — пунктирный «маршрут» и координаты ресторана из настроек.
 */
export function HomePromos({ promos, geo }: { promos: PromoItem[]; geo?: { lat: number | null; lng: number | null } }) {
  if (promos.length === 0) return null;
  const [feature, ...rest] = promos;
  const coords = geo?.lat != null && geo?.lng != null ? `${formatCoord(geo.lat, "lat")} · ${formatCoord(geo.lng, "lng")}` : null;

  return (
    <section data-promos aria-label="Предложения ресторана" className="relative isolate mt-8 overflow-hidden py-16 lg:mt-12 lg:py-28">
      {/* Фон: хвойная основа со светом, зерно бумаги, ветка морошки */}
      <div aria-hidden className="promo-stage-bg absolute inset-0 -z-10" />
      <div aria-hidden className="promo-stage-grain absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="promo-stage-berry absolute -right-40 bottom-[18%] -z-10 h-[380px] w-[380px] md:bottom-[-6%] md:h-[560px] md:w-[560px] lg:-right-24 lg:h-[720px] lg:w-[720px]"
      />

      <div className="container-site relative">
        <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 lg:mb-12">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-berry uppercase">
            <span className="h-px w-8 bg-berry/70" aria-hidden />
            Сейчас в «Морошке»
          </p>
          {coords && <p className="text-xs tracking-[0.18em] text-lichen/75 tabular-nums xl:hidden">{coords}</p>}
        </div>

        <div className={`relative grid gap-6 ${rest.length ? "xl:grid-cols-12 xl:items-start xl:gap-8" : ""}`}>
          <FeaturePromo promo={feature} wide={!rest.length} />

          {rest.length > 0 && (
            <div className="relative flex flex-col gap-6 md:ml-auto md:w-[68%] xl:col-span-4 xl:ml-0 xl:w-auto xl:pt-36">
              {/* Маршрут от главной карточки к остальным и координаты ресторана — только на широком экране (от 1280 px) */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden h-36 xl:block">
                <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                  <path
                    d="M -12 18 C 18 14, 34 30, 30 58 S 22 92, 34 104"
                    stroke="rgb(242 160 58 / 0.4)"
                    strokeWidth="1.2"
                    strokeDasharray="2 7"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <span className="absolute top-[18%] -left-[12%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-berry/70" />
                <span className="absolute top-[18%] -left-[12%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-berry/30" />
                {coords && (
                  <p className="absolute top-4 right-0 text-right text-[11px] leading-relaxed tracking-[0.2em] text-lichen/75 uppercase tabular-nums">
                    {coords.split(" · ").map((c) => (
                      <span key={c} className="block">
                        {c}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              {rest.map((p, i) => (
                <SidePromo key={p.id} promo={p} n={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Главная карточка: фото крупно и с выступом за рамку, текст справа */
function FeaturePromo({ promo, wide }: { promo: PromoItem; wide: boolean }) {
  return (
    <article
      className={`promo-surface-feature relative grid ${promo.image ? "md:grid-cols-[minmax(0,1fr)_minmax(min-content,1fr)]" : ""} ${wide ? "" : "xl:col-span-8"}`}
    >
      {promo.image && (
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] xl:-my-6 xl:-ml-6">
          <Image src={promo.image.url} alt={promo.image.alt} fill sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw" className="object-cover object-[50%_72%] xl:object-top" />
          {/* Лёгкая виньетка — фото не спорит с рамкой карточки */}
          <div aria-hidden className="absolute inset-0 shadow-[inset_0_0_80px_rgb(14_23_20/0.35)]" />
        </div>
      )}
      <div className="flex flex-col justify-center gap-4 p-7 sm:p-9 lg:p-11">
        <p className="flex items-baseline gap-3 text-[11px] font-semibold tracking-[0.26em] text-berry uppercase">
          <span className="font-display text-[13px] tracking-normal tabular-nums">{index(0)}</span>
          Предложение
        </p>
        <h2 className="h-display text-[2rem] sm:text-4xl xl:text-[2.5rem]">
          {promo.title}
        </h2>
        {promo.text && (
          <p className="max-w-md border-t border-snow/[0.08] pt-4 text-[16px] leading-relaxed text-soft lg:text-[17px]">{promo.text}</p>
        )}
        <PromoLink promo={promo} className="btn btn-berry mt-2 self-start" />
      </div>
    </article>
  );
}

/** Остальные карточки: оливковая поверхность, меньший вес, ссылка — контурной кнопкой */
function SidePromo({ promo, n }: { promo: PromoItem; n: number }) {
  return (
    <article className="promo-surface-olive relative flex flex-col overflow-hidden">
      {promo.image && (
        <div className="relative aspect-[16/10]">
          <Image src={promo.image.url} alt={promo.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="relative flex flex-col gap-4 p-7 sm:p-9">
        <p className="flex items-baseline gap-3 text-[11px] font-semibold tracking-[0.26em] text-berry uppercase">
          <span className="font-display text-[13px] tracking-normal tabular-nums">{index(n)}</span>
          Предложение
        </p>
        <h2 className="h-display text-[1.75rem] sm:text-[2rem]">{promo.title}</h2>
        {promo.text && <p className="text-[15px] leading-relaxed text-soft">{promo.text}</p>}
        <PromoLink
          promo={promo}
          className="btn btn-sm mt-1 self-start border border-snow/25 font-semibold text-snow hover:border-berry hover:text-berry"
        />
      </div>
    </article>
  );
}

/** Промо в меню: компактная полоса над категориями, светлая тема */
export function MenuPromos({ promos }: { promos: PromoItem[] }) {
  if (promos.length === 0) return null;
  return (
    <div className="mt-8 grid gap-3">
      {promos.map((p) => (
        <article key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-border bg-[#fffdf9] p-5 lg:px-7">
          {p.image && (
            <div className="relative hidden h-16 w-24 shrink-0 sm:block">
              <Image src={p.image.url} alt={p.image.alt} fill sizes="96px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1 basis-60">
            <h2 className="text-lg font-bold">{p.title}</h2>
            {p.text && <p className="mt-0.5 text-sm text-muted">{p.text}</p>}
          </div>
          <PromoLink promo={p} className="btn btn-ink btn-sm" />
        </article>
      ))}
    </div>
  );
}
