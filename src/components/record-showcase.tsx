import Image from "next/image";
import type { PageSection } from "@/lib/content";
import { CmsContent } from "./cms-content";
import { RECORD_LOGO } from "./page-sections";
import { PhotoLightbox } from "./photo-lightbox";

/**
 * Иконки к цифрам рекорда — по порядку цифр в админке (О ресторане → секция «Событие с цифрами»):
 * 1 — олень (вес рёбер), 2 — тарелка с приборами (порции), 3 — гости (бесплатно).
 * Заменить на свои — поменять path в STAT_ICONS (viewBox 32×32, линия 1.5). Цифр больше трёх — номер.
 */
const STAT_ICONS: React.ReactNode[] = [
  // Олень: голова, уши и ветвистые рога
  <g key="deer">
    <path d="M12.5 12c0-1 1.5-1.6 3.5-1.6s3.5.6 3.5 1.6l-.9 7.6c-.4 2.6-1.4 4.1-2.6 4.1s-2.2-1.5-2.6-4.1L12.5 12Z" />
    <path d="M12.6 12.6 9.4 12l2.4 2.3M19.4 12.6l3.2-.6-2.4 2.3" />
    <path d="M13.4 10.6 9.6 6.2 6.4 4.6M9.6 6.2 8.8 2.8M11.4 8.3l-2.8.4M18.6 10.6l3.8-4.4 3.2-1.6M22.4 6.2l.8-3.4M20.6 8.3l2.8.4" />
    <path d="M15.1 22h1.8" />
    <circle cx="14.4" cy="15.2" r=".5" />
    <circle cx="17.6" cy="15.2" r=".5" />
  </g>,
  // Тарелка с вилкой и ножом
  <g key="plate">
    <circle cx="16" cy="17" r="7.5" />
    <circle cx="16" cy="17" r="4.6" />
    <path d="M5 6v6.5M3.4 6v3.8a1.6 1.6 0 0 0 3.2 0V6M5 12.5V27" />
    <path d="M28 6c-1.7 1-2.3 3.6-2.3 7.4h2.3V27" />
  </g>,
  // Гости: трое
  <g key="guests">
    <circle cx="16" cy="11" r="3.2" />
    <path d="M10.4 25c0-3.4 2.5-5.9 5.6-5.9s5.6 2.5 5.6 5.9" />
    <circle cx="8" cy="13.4" r="2.4" />
    <path d="M3.2 24c0-2.8 2-4.7 4.6-4.7 1 0 1.9.3 2.6.8" />
    <circle cx="24" cy="13.4" r="2.4" />
    <path d="M28.8 24c0-2.8-2-4.7-4.6-4.7-1 0-1.9.3-2.6.8" />
  </g>,
];

function StatIcon({ n }: { n: number }) {
  const icon = STAT_ICONS[n];
  if (!icon) {
    return <span className="grid h-10 w-10 place-items-center sm:h-12 sm:w-12 rounded-full ring-1 ring-berry/50 text-sm text-berry tabular-nums">{n + 1}</span>;
  }
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10 text-berry sm:h-12 sm:w-12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {icon}
    </svg>
  );
}

/**
 * Рекорд России на главной — по референсу заказчика: слева на фоне сцены логотип Книги рекордов,
 * подпись, крупный заголовок и цифры с иконками; справа «стеклянная» карточка с текстом,
 * фото (открываются в окне) и ссылкой на запись в Книге рекордов. Данные — те же, что на «О ресторане».
 */
export function RecordShowcase({ section }: { section: Extract<PageSection, { kind: "highlight" }> }) {
  return (
    <section
      aria-label={section.title}
      className="container-site grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_680px] xl:gap-12"
    >
      <div className="record-intro">
        <span className="inline-block rounded-[14px] bg-white px-4 py-2.5 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]">
          <Image src={RECORD_LOGO.src} alt={RECORD_LOGO.alt} width={RECORD_LOGO.width} height={RECORD_LOGO.height} className="h-12 w-auto lg:h-14" />
        </span>
        {section.eyebrow && (
          <p className="mt-6 flex items-center gap-3 text-xs tracking-[0.24em] text-berry uppercase">
            <span aria-hidden className="h-3.5 w-px bg-berry/80" />
            {section.eyebrow}
          </p>
        )}
        <h2 className="h-display mt-4 text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[3rem] xl:text-[3.5rem]">{section.title}</h2>

        {section.stats.length > 0 && (
          <dl className="mt-8 grid grid-cols-3 gap-2.5 sm:max-w-xl sm:gap-3">
            {section.stats.map((st, i) => (
              <div key={st.value} className="record-stat flex flex-col items-center rounded-[18px] px-2 py-4 text-center sm:px-3 sm:py-5">
                <StatIcon n={i} />
                <dt className="sr-only">{st.label ?? st.value}</dt>
                <dd className="mt-2.5">
                  <span className="block font-display text-[1.15rem] leading-tight font-light text-berry sm:text-[1.6rem] lg:text-[1.25rem] xl:text-[1.6rem]">{st.value}</span>
                  {st.label && <span className="mt-1 block text-[11px] leading-snug text-soft sm:text-xs">{st.label}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Внутри карточки: слева текст и ссылка, справа столбик фото 3:4 (на телефоне фото — под текстом, в ряд) */}
      <div className="booking-glass record-card rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
        <div className="record-layout grid gap-6 sm:grid-cols-[minmax(0,1fr)_170px] sm:gap-7 xl:grid-cols-[minmax(0,1fr)_180px]">
          <div className="flex flex-col items-start">
            <div className="[&_.prose-moroshka]:space-y-2.5 [&_.prose-moroshka]:text-[15px] [&_.prose-moroshka]:leading-[1.5] [&_.prose-moroshka]:text-snow/90">
              <CmsContent data={section.content} />
            </div>
            {section.link && (
              <a href={section.link.url} target="_blank" rel="noopener noreferrer" className="btn btn-berry btn-sm mt-6">
                {section.link.label} <span aria-hidden>↗</span>
              </a>
            )}
          </div>
          {section.images.length > 0 && (
            // Кадр превью: у портрета (1-е фото) — выше, чтобы не срезать лицо; у диплома (2-е) — ниже
            <PhotoLightbox
              images={section.images}
              gridClassName="grid grid-cols-2 content-center gap-3 sm:grid-cols-1"
              thumbClassName="aspect-[3/4]"
              imageClassName={["object-[50%_22%]", "object-[50%_75%]"]}
              sizes="(min-width: 640px) 180px, 50vw"
            />
          )}
        </div>
      </div>
    </section>
  );
}
