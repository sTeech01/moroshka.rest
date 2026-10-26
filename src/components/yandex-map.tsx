/**
 * Яндекс Карта с меткой ресторана (виджет-iframe, без ключа API).
 * Тёмная под стиль сайта: invert + hue-rotate(180°) меняет светлое на тёмное,
 * но сохраняет оттенки (оранжевая метка, зелень). Ослабить/убрать — поправить класс фильтра.
 */
export function YandexMap({ lat, lng, className = "" }: { lat: number; lng: number; className?: string }) {
  const point = `${lng}%2C${lat}`;
  return (
    <div className={`relative overflow-hidden rounded-card bg-stone shadow-(--shadow-soft) ${className}`}>
      <iframe
        src={`https://yandex.ru/map-widget/v1/?ll=${point}&z=16&pt=${point}%2Cpm2orm`}
        title="Ресторан «Морошка» на карте"
        className="absolute inset-0 h-full w-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)]"
        loading="lazy"
      />
    </div>
  );
}

/** Маршрут в Яндекс Картах от текущего местоположения до ресторана */
export const yandexRouteUrl = (lat: number, lng: number) => `https://yandex.ru/maps/?rtext=~${lat}%2C${lng}&rtt=auto`;
