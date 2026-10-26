import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { getUpcomingEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Афиша",
  description: "События, гастро-ужины и вечера с музыкой в ресторане «Морошка».",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="container-site py-12">
      <h1 className="h-display text-5xl">Афиша</h1>
      {events.length === 0 ? (
        <div className="surface-moss shape-leaf mt-8 max-w-2xl p-8 shadow-(--shadow-soft) sm:p-10">
          <p className="text-[17px] leading-relaxed text-soft">Скоро здесь появятся новые события. Следите за нами в соцсетях.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-berry btn-sm">
              Меню
            </Link>
            <Link href="/#booking" className="btn btn-line btn-sm">
              Забронировать стол
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
