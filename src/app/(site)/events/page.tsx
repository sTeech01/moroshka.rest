import type { Metadata } from "next";
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
        <p className="mt-6 text-muted">Скоро здесь появятся новые события. Следите за нами в соцсетях.</p>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
