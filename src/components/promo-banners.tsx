import Image from "next/image";
import Link from "next/link";
import type { PromoItem } from "@/lib/content";

function PromoLink({ promo, className, arrow = false }: { promo: PromoItem; className: string; arrow?: boolean }) {
  if (!promo.linkUrl) return null;
  const external = /^https?:\/\//.test(promo.linkUrl);
  const label = (
    <>
      {promo.linkLabel}
      {arrow && <ArrowIcon />}
    </>
  );
  return external ? (
    <a href={promo.linkUrl} className={className} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <Link href={promo.linkUrl} className={className}>
      {label}
    </Link>
  );
}

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="ml-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

/** Бизнес-ланч узнаём по ссылке промо: у его карточки фоном своё фото (globals.css → .promo-surface-lunch) */
const isLunch = (promo: PromoItem) => Boolean(promo.linkUrl?.includes("business-lunch"));

const index = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Предложения на главной — редакционная композиция; фон даёт сцена (ScrollStage), стили .promo-* в globals.css.
 * Первое промо — главная карточка с фото, выступающим за её край, на тёмно-хвойном фоне с золотой гравюрой;
 * остальные — карточки справа, смещённые вниз (у бизнес-ланча фоном фото супа). Формы мягкие и асимметричные («лист»).
 */
export function HomePromos({ promos }: { promos: PromoItem[] }) {
  if (promos.length === 0) return null;
  const [feature, ...rest] = promos;

  return (
    <div data-promos className="container-site relative">
      <p className="mb-8 text-[11px] font-semibold tracking-[0.26em] text-berry uppercase lg:mb-12">Сейчас в «Морошке»</p>

      <div className={`relative grid gap-6 ${rest.length ? "xl:grid-cols-12 xl:items-start xl:gap-8" : ""}`}>
        <FeaturePromo promo={feature} wide={!rest.length} />

        {rest.length > 0 && (
          <div className="relative flex flex-col gap-6 md:ml-auto md:w-[68%] xl:col-span-4 xl:ml-0 xl:w-auto xl:pt-28">
            {rest.map((p, i) => (
              <SidePromo key={p.id} promo={p} n={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Главная карточка: фото крупно и с выступом за рамку, текст справа */
function FeaturePromo({ promo, wide }: { promo: PromoItem; wide: boolean }) {
  return (
    <article
      className={`promo-surface-feature shape-leaf relative grid ${promo.image ? "md:grid-cols-[minmax(0,1fr)_minmax(min-content,1fr)]" : ""} ${wide ? "" : "xl:col-span-8"}`}
    >
      {promo.image && (
        <div className="shape-leaf relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[420px] xl:-my-6 xl:-ml-6">
          <Image src={promo.image.url} alt={promo.image.alt} fill sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw" className="object-cover object-[50%_72%] xl:object-top" />
          {/* Лёгкая виньетка — фото не спорит с рамкой карточки */}
          <div aria-hidden className="absolute inset-0 shadow-[inset_0_0_80px_rgb(14_23_20/0.35)]" />
        </div>
      )}
      <div className="promo-feature-text flex flex-col justify-center gap-4 p-7 sm:p-9 lg:p-11">
        <p className="flex items-baseline gap-3 text-[11px] font-semibold tracking-[0.24em] text-berry uppercase">
          <span className="font-display text-[13px] tracking-normal tabular-nums">{index(0)}</span>
          Предложение
        </p>
        <h2 className="h-display text-[2rem] sm:text-4xl xl:text-[2.5rem]">
          {promo.title}
        </h2>
        {promo.text && (
          <p className="max-w-md pt-1 text-[16px] leading-relaxed text-soft lg:text-[17px]">{promo.text}</p>
        )}
        <PromoLink promo={promo} arrow className="group btn btn-berry mt-2 self-start" />
      </div>
    </article>
  );
}

/** Остальные карточки: оливковая поверхность (у бизнес-ланча — фото фоном), меньший вес, ссылка — контурной кнопкой */
function SidePromo({ promo, n }: { promo: PromoItem; n: number }) {
  const lunch = isLunch(promo);
  return (
    <article className={`${lunch ? "promo-surface-lunch" : "promo-surface-olive"} shape-leaf-alt relative flex flex-col overflow-hidden`}>
      {promo.image && !lunch && (
        <div className="relative aspect-[16/10]">
          <Image src={promo.image.url} alt={promo.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
        </div>
      )}
      {/* У бизнес-ланча текст — в левой части, справа на фоне фото */}
      <div className={`relative flex flex-col gap-4 p-7 sm:p-9 ${lunch ? "max-w-[80%] pr-0 sm:max-w-[72%] sm:py-10 sm:pr-0" : ""}`}>
        <p className="flex items-baseline gap-3 text-[11px] font-semibold tracking-[0.26em] text-berry uppercase">
          <span className="font-display text-[13px] tracking-normal tabular-nums">{index(n)}</span>
          Предложение
        </p>
        <h2 className="h-display text-[1.75rem] sm:text-[2rem]">{promo.title}</h2>
        {promo.text && <p className={`text-[15px] leading-relaxed text-soft ${lunch ? "sm:max-w-[13rem]" : ""}`}>{promo.text}</p>}
        <PromoLink promo={promo} arrow className="group btn btn-line btn-sm mt-1 self-start whitespace-nowrap text-snow" />
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
        <article key={p.id} className="card-soft flex flex-wrap items-center gap-x-6 gap-y-3 p-5 lg:px-7">
          {p.image && (
            <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-[12px] sm:block">
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
