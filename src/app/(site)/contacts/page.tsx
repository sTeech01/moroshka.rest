import type { Metadata } from "next";
import Link from "next/link";
import { getDelivery, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, телефон и часы работы ресторана «Морошка» в Губкинском.",
  alternates: { canonical: "/contacts" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-3.5">
      <div className="eyebrow text-[11px] tracking-[0.24em]">{label}</div>
      <div className="mt-1 text-base leading-relaxed">{children}</div>
    </div>
  );
}

export default async function ContactsPage() {
  const [s, delivery] = await Promise.all([getSettings(), getDelivery()]);
  const tel = s.phone.replace(/[^\d+]/g, "");
  const hasGeo = Boolean(s.geo.lat && s.geo.lng);
  const point = `${s.geo.lng}%2C${s.geo.lat}`;
  const mapSrc = hasGeo ? `https://yandex.ru/map-widget/v1/?ll=${point}&z=16&pt=${point}%2Cpm2orm` : null;
  // Маршрут в Яндекс Картах: от текущего местоположения до ресторана
  const routeUrl = hasGeo ? `https://yandex.ru/maps/?rtext=~${s.geo.lat}%2C${s.geo.lng}&rtt=auto` : null;

  return (
    // Компактно: заголовок, карточка и карта помещаются в один экран ноутбука
    <div className="container-site pt-8 pb-12 lg:pt-10">
      <h1 className="h-display text-4xl lg:text-5xl">Контакты</h1>

      {/* Две колонки одной высоты: карточка контактов и карта */}
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col border border-border">
          <div className="divide-y divide-border">
            <Row label="Адрес">{s.address}</Row>
            <Row label="Телефон">
              <a href={`tel:${tel}`} className="font-semibold hover:text-berry">
                {s.phone}
              </a>
            </Row>
            <Row label="Часы работы">
              {s.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <span className="text-soft">{h.days}</span>
                  <span>{h.time}</span>
                </div>
              ))}
            </Row>
            {delivery.enabled && (
              <Row label="Доставка">
                <div className="flex justify-between gap-4">
                  <span className="text-soft">Приём заказов</span>
                  <span>
                    {delivery.acceptFrom}–{delivery.acceptUntil}
                  </span>
                </div>
              </Row>
            )}
            {(s.vk || s.telegram) && (
              <Row label="Мы в соцсетях">
                <div className="flex gap-5">
                  {s.vk && (
                    <a href={s.vk} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-berry">
                      ВКонтакте
                    </a>
                  )}
                  {s.telegram && (
                    <a href={s.telegram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-berry">
                      Telegram
                    </a>
                  )}
                </div>
              </Row>
            )}
          </div>

          {/* Действия прижаты к низу карточки — низ совпадает с низом карты */}
          <div className="mt-auto grid gap-3 border-t border-border px-6 py-4 sm:grid-cols-2">
            <a href={`tel:${tel}`} className="btn btn-berry btn-sm">
              Позвонить
            </a>
            {routeUrl ? (
              <a href={routeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                Построить маршрут
              </a>
            ) : (
              <Link href="/#booking" className="btn btn-line btn-sm">
                Забронировать стол
              </Link>
            )}
          </div>
        </div>

        {mapSrc && (
          // Высоту на десктопе задаёт карточка контактов — карта тянется вровень с ней
          <div className="relative min-h-[320px] overflow-hidden border border-border">
            {/*
              Тёмная карта: invert + hue-rotate(180°) меняет светлое на тёмное, но сохраняет оттенки
              (оранжевая метка, зелень). Ослабить/убрать — поправить или удалить класс фильтра.
            */}
            <iframe
              src={mapSrc}
              title="Ресторан «Морошка» на карте"
              className="absolute inset-0 h-full w-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)]"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
