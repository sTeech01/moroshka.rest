import type { getSettings } from "@/lib/content";
import { formatTimeRange, formatWeekdaysFull } from "@/lib/format";
import { YandexMap } from "./yandex-map";

type Settings = Awaited<ReturnType<typeof getSettings>>;

/**
 * Контакты — по референсу заказчика: слева крупный светлый заголовок, адрес, телефон,
 * часы работы и реквизиты; справа большая карта в тёмной теме сайта.
 * Один и тот же блок на главной (последняя сцена) и на странице «Контакты» (там заголовок — h1).
 */
export function ContactsShowcase({ settings, heading: Heading = "h2" }: { settings: Settings; heading?: "h1" | "h2" }) {
  const tel = settings.phone.replace(/[^\d+]/g, "");
  const geo = settings.geo.lat && settings.geo.lng ? { lat: settings.geo.lat, lng: settings.geo.lng } : null;

  return (
    <section aria-label="Контакты" className={`container-site grid items-center gap-10 ${geo ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
      <div>
        <Heading className="h-display text-[2.75rem] text-snow/85 uppercase lg:text-[3.25rem]">Контакты</Heading>
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
      {geo && (
        <YandexMap
          lat={geo.lat}
          lng={geo.lng}
          className="aspect-[700/625] w-full rounded-lg! lg:aspect-auto lg:h-[min(625px,calc(100svh-11rem))]"
        />
      )}
    </section>
  );
}
