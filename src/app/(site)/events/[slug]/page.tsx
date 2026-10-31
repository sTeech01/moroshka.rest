import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CmsContent } from "@/components/cms-content";
import { formatEventDate } from "@/components/event-card";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { getEvent, getEvents } from "@/lib/content";
import { splitEventStory } from "@/lib/event-story";

export async function generateStaticParams() {
  const events = await getEvents();
  // Cache Components требует хотя бы один параметр
  return events.length > 0 ? events.map((e) => ({ slug: e.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary ?? undefined,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: event.cover ? { images: [event.cover.url] } : undefined,
  };
}

// Каркас страницы показывается сразу при переходе, данные события подставляются следом
export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="container-site max-w-3xl space-y-4 py-12 lg:py-16" aria-busy>
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-14 w-3/4" />
          <div className="skeleton aspect-video rounded-panel" />
        </div>
      }
    >
      <EventContent params={params} />
    </Suspense>
  );
}

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

function Actions({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Link href="/#booking" className="btn btn-berry h-14 px-8">
        Забронировать стол <ArrowIcon />
      </Link>
      <Link href="/menu" className="btn btn-line h-14 px-8 text-snow">
        Меню ресторана
      </Link>
    </div>
  );
}

/**
 * Страница события. Текст из админки разбирается на части (lib/event-story):
 * первый экран — дата, заголовок, кратко и обложка; дальше вступление, карточки
 * (абзацы «**Название** — описание», например новые меню), фото из текста рядом с заключением
 * и кнопки ещё раз. Фото открываются во весь экран.
 */
async function EventContent({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  const story = splitEventStory(event.content);
  const cover = event.cover;

  return (
    <article className="pb-16 lg:pb-24">
      {/* Первый экран: текст слева, обложка справа во весь рост (обложки — вертикальные афиши блюд) */}
      <header className="container-site grid items-center gap-10 pt-8 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16 lg:pt-14 lg:pb-20">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-berry">
            ← На главную
          </Link>
          <p className="mt-8 flex items-center gap-3 text-xs tracking-[0.24em] text-berry uppercase lg:mt-12">
            <span aria-hidden className="h-3.5 w-px bg-berry/80" />
            {formatEventDate(event.date)}
          </p>
          <h1 className="h-display mt-4 text-[2.75rem] sm:text-6xl xl:text-[4.25rem]">{event.title}</h1>
          {event.summary && <p className="mt-6 max-w-xl text-lg leading-relaxed text-soft lg:text-xl">{event.summary}</p>}
          <Actions className="mt-9" />
        </div>
        {cover && (
          <div className="mx-auto w-full max-w-[420px]">
            <PhotoLightbox
              images={[cover]}
              gridClassName="grid"
              thumbClassName="shape-leaf aspect-[2/3] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)]"
              sizes="(min-width: 1024px) 420px, 90vw"
            />
          </div>
        )}
      </header>

      {story.intro && (
        <section className="container-site">
          <div className="event-lead max-w-3xl border-t border-snow/10 pt-12 lg:pt-16">
            <CmsContent data={story.intro} />
          </div>
        </section>
      )}

      {story.features.length > 0 && (
        <section aria-label="Подробнее" className={`container-site mt-10 grid gap-5 lg:mt-14 lg:gap-6 ${story.features.length > 1 ? "md:grid-cols-2" : ""}`}>
          {story.features.map((f, i) => (
            <div key={f.title} data-bg className={`event-feature ${i % 2 ? "shape-leaf-alt" : "shape-leaf"} relative flex min-h-[280px] flex-col p-7 sm:p-10 lg:min-h-[320px]`}>
              <span className="font-display text-sm text-berry tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="h-display mt-auto pt-10 sm:max-w-[78%] text-[2rem] text-snow lg:text-[2.5rem]">{f.title}</h2>
              <p className="mt-4 max-w-[85%] text-[17px] sm:max-w-[68%] leading-relaxed text-soft">{f.text}</p>
            </div>
          ))}
        </section>
      )}

      {(story.images.length > 0 || story.outro) && (
        <section
          className={`container-site mt-16 grid items-center gap-10 lg:mt-24 ${story.images.length ? "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16" : ""}`}
        >
          {story.images.length > 0 && (
            <div className="mx-auto w-full max-w-[340px]">
              <PhotoLightbox
                images={story.images}
                gridClassName={`grid gap-4 ${story.images.length > 1 ? "grid-cols-2" : ""}`}
                thumbClassName="shape-leaf-alt aspect-[9/16]"
                sizes="(min-width: 1024px) 340px, 90vw"
              />
              {/* Подпись — из описания фото в админке (название блюда и цена) */}
              {story.images.length === 1 && story.images[0].alt && <p className="mt-4 text-sm leading-relaxed text-muted">{story.images[0].alt}</p>}
            </div>
          )}
          <div className="max-w-2xl">
            {story.outro && (
              <div className="event-outro">
                <CmsContent data={story.outro} />
              </div>
            )}
            <Actions className="mt-10" />
          </div>
        </section>
      )}
    </article>
  );
}
