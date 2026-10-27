import Image from "next/image";
import type { PageSection } from "@/lib/content";
import { CmsContent } from "./cms-content";

/** Секции страницы из CMS (Страницы → Секции): «Текст + фото» и «Событие с цифрами» */
export function PageSections({ sections }: { sections: PageSection[] }) {
  if (sections.length === 0) return null;
  return (
    <div className="space-y-14 lg:space-y-20">
      {sections.map((s) => (s.kind === "textImage" ? <TextImage key={s.id} section={s} /> : <Highlight key={s.id} section={s} />))}
    </div>
  );
}

function TextImage({ section }: { section: Extract<PageSection, { kind: "textImage" }> }) {
  const imageLeft = section.imagePosition === "left";
  return (
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={imageLeft ? "lg:order-2" : ""}>
        <CmsContent data={section.content} />
      </div>
      {section.image && (
        <div className={`relative aspect-[4/5] overflow-hidden shadow-(--shadow-soft) ${imageLeft ? "shape-leaf-alt lg:order-1" : "shape-leaf"}`}>
          <Image src={section.image.url} alt={section.image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      )}
    </section>
  );
}

/** Официальный логотип Книги рекордов России (с их сайта, векторный оригинал → WebP) */
export const RECORD_LOGO = { src: "/images/about/kniga-rekordov-rossii.webp", alt: "Книга рекордов России", width: 720, height: 347 };

/** Секция «Событие с цифрами» — на «О ресторане» и (рекорд России) на главной */
export function Highlight({ section }: { section: Extract<PageSection, { kind: "highlight" }> }) {
  // Секция о рекорде (ссылка на Книгу рекордов России) — с официальным логотипом над заголовком
  const isRecord = section.link?.url.includes("knigarekordovrossii.ru") ?? false;
  return (
    <section className="surface-moss rounded-panel p-6 shadow-(--shadow-soft) sm:p-10 lg:p-14">
      <div className="text-center">
        {isRecord && (
          <span className="mb-6 inline-block rounded-[12px] bg-white px-4 py-2.5">
            <Image src={RECORD_LOGO.src} alt={RECORD_LOGO.alt} width={RECORD_LOGO.width} height={RECORD_LOGO.height} className="h-14 w-auto lg:h-16" />
          </span>
        )}
        {section.eyebrow && <p className="eyebrow text-berry">{section.eyebrow}</p>}
        <h2 className="h-display mx-auto mt-4 max-w-3xl text-4xl lg:text-5xl">{section.title}</h2>
      </div>

      {section.stats.length > 0 && (
        <dl className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-flow-col sm:auto-cols-fr">
          {section.stats.map((st) => (
            <div key={st.value} className="rounded-card bg-night/35 px-4 py-4 text-center sm:py-6">
              <dt className="sr-only">{st.label ?? st.value}</dt>
              <dd>
                <span className="h-display block text-4xl text-berry lg:text-5xl">{st.value}</span>
                {st.label && <span className="mt-2 block text-sm text-muted">{st.label}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className={`mt-10 grid gap-10 ${section.images.length ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14" : ""}`}>
        <div>
          {section.content && <CmsContent data={section.content} />}
          {section.link && (
            <a href={section.link.url} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm mt-8">
              {section.link.label} ↗
            </a>
          )}
        </div>
        {section.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {section.images.map((img) => (
              <div key={img.url} className="relative aspect-[3/4] overflow-hidden rounded-card">
                <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
