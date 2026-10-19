import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CmsContent } from "@/components/cms-content";
import { formatEventDate } from "@/components/event-card";
import { getEvent, getEvents } from "@/lib/content";

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
          <div className="h-5 w-40 animate-pulse bg-fill" />
          <div className="h-14 w-3/4 animate-pulse bg-fill" />
          <div className="aspect-video animate-pulse bg-fill" />
        </div>
      }
    >
      <EventContent params={params} />
    </Suspense>
  );
}

async function EventContent({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();

  return (
    <article className="container-site max-w-3xl py-12 lg:py-16">
      <Link href="/events" className="text-sm text-muted hover:text-text">
        ← Афиша
      </Link>
      <div className="mt-8 text-[13px] tracking-[0.16em] text-berry uppercase">{formatEventDate(event.date)}</div>
      <h1 className="h-display mt-3 text-5xl lg:text-6xl">{event.title}</h1>
      {event.cover && (
        <div className="relative mt-10 aspect-video overflow-hidden">
          <Image src={event.cover.url} alt={event.cover.alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-10">
        <CmsContent data={event.content} />
      </div>
      <Link href="/#booking" className="btn btn-berry mt-12 h-14 px-8">
        Забронировать стол
      </Link>
    </article>
  );
}
